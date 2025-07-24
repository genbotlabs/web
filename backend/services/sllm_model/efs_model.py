from typing import TypedDict, List, Annotated
from langchain_core.documents import Document
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langgraph.graph import StateGraph
from transformers import AutoTokenizer, AutoModelForCausalLM, GenerationConfig
import torch
import os
from dotenv import load_dotenv

# ─── 환경 변수 로딩 ───────────────────────
load_dotenv()

# ─── FAISS DB + 임베딩 로딩 ──────────────
embedding_model = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-large-instruct")
vectorstore = FAISS.load_local("card_QA_faiss_db", embedding_model, allow_dangerous_deserialization=True)

# ─── EFS 모델 경로 설정 ───────────────────
efs_model_path = "/mnt/efs/kanana_model"

# ─── 모델 로딩 함수 정의 (1회 로딩 후 캐시) ─────────────
_tokenizer = None
_model = None
_generation_config = None

def get_midm_model():
    global _tokenizer, _model, _generation_config

    if _tokenizer is None or _model is None or _generation_config is None:
        print("🔄 EFS에서 모델 로딩 중...")
        _tokenizer = AutoTokenizer.from_pretrained(efs_model_path)
        _model = AutoModelForCausalLM.from_pretrained(
            efs_model_path,
            device_map="auto",
            torch_dtype=torch.bfloat16,
            trust_remote_code=True
        )
        _generation_config = GenerationConfig.from_pretrained(efs_model_path)
        print("✅ 모델 로딩 완료")
    
    return _tokenizer, _model, _generation_config

# ─── LangGraph용 상태 정의 ────────────────
class GraphState(TypedDict):
    question: Annotated[str, "질문"]
    answer: Annotated[str, "답변"]
    score: Annotated[float, "유사도 점수"]
    retriever_docs: Annotated[List[Document], "유사도 상위문서"]

# ─── LangGraph 노드 정의 ─────────────────────────────
def generate_with_midm(question: str, context: str) -> str:
    tokenizer, model, _ = get_midm_model()

    system_prompt = "..."
    user_prompt = f"문서: {context}\n질문: {question}\n위 문서를 참고해서 질문에 답변해줘."

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    input_ids = tokenizer.apply_chat_template(
        messages,
        tokenize=True,
        add_generation_prompt=True,
        return_tensors="pt"
    ).to("cuda")

    output = model.generate(
        input_ids=input_ids,
        max_new_tokens=1024,
        do_sample=True,
        temperature=0.8,
        top_p=0.75,
        top_k=20,
        pad_token_id=tokenizer.pad_token_id,
        eos_token_id=tokenizer.eos_token_id
    )
    return tokenizer.decode(output[0], skip_special_tokens=True)

def retriever_node(state: GraphState) -> GraphState:
    docs = vectorstore.similarity_search_with_score(state["question"], k=3)
    retrieved_docs = [doc for doc, _ in docs]
    score = docs[0][1] if docs else 0.0
    return {
        "question": state["question"],
        "retriever_docs": retrieved_docs,
        "score": score,
        "answer": ""
    }

def llm_answer_node(state: GraphState) -> GraphState:
    context = "\n---\n".join([doc.page_content for doc in state["retriever_docs"]])
    answer = generate_with_midm(state["question"], context)
    return {
        "question": state["question"],
        "retriever_docs": state["retriever_docs"],
        "score": state["score"],
        "answer": answer
    }

def query_rewrite_node(state: GraphState) -> GraphState:
    # 생략 가능
    return state

def decide_to_generate(state: GraphState) -> str:
    return "llm_answer" if state["score"] <= 0.5 else "query_rewrite"

# ─── LangGraph 워크플로 정의 ─────────────────────
workflow = StateGraph(GraphState)
workflow.add_node("retriever", retriever_node)
workflow.add_node("llm_answer", llm_answer_node)
workflow.add_node("query_rewrite", query_rewrite_node)
workflow.set_entry_point("retriever")
workflow.add_conditional_edges("retriever", decide_to_generate, {
    "llm_answer": "llm_answer",
    "query_rewrite": "query_rewrite"
})
workflow.add_edge("query_rewrite", "retriever")

# ✅ 최종 컴파일된 graph
app_graph = workflow.compile()
