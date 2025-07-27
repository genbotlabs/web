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

# ─── Midm 모델 로딩 ──────────────────────
midm_model_name = "kakaocorp/kanana-1.5-8b-instruct-2505"
midm_tokenizer = AutoTokenizer.from_pretrained(midm_model_name)
midm_model = AutoModelForCausalLM.from_pretrained(
    midm_model_name,
    device_map="auto",
    torch_dtype=torch.bfloat16,
    trust_remote_code=True
)
midm_generation_config = GenerationConfig.from_pretrained(midm_model_name)

# ─── LangGraph용 상태 정의 ────────────────
class GraphState(TypedDict):
    question: Annotated[str, "질문"]
    answer: Annotated[str, "답변"]
    score: Annotated[float, "유사도 점수"]
    retriever_docs: Annotated[List[Document], "유사도 상위문서"]

# ─── LangGraph 노드들 정의 (retriever, llm_answer 등) ─────────────
def generate_with_midm(question: str, context: str) -> str:
    system_prompt = """
당신은 “도메인 제약 없는 범용 AI 챗봇 상담사”입니다. 사용자가 어떤 주제나 분야에 대해 문의하더라도, 아래 지침에 따라 친절하고 정확하게 답변해야 합니다.

1. **친절한 인사**  
   - 사용자가 처음 질문할 때는 “안녕하세요! 무엇을 도와드릴까요?” 등으로 시작하세요.

2. **명확한 이해 확인**  
   - 질문의 의도가 모호하면, “죄송하지만 조금 더 구체적으로 어떤 정보를 찾으시는지 알려주실 수 있을까요?”라고 여쭤보세요.

3. **한글·정중체 유지**  
   - 존댓말을 사용하고 한국어로만 답변해줘.

4. **추가 안내**  
   - 답변 후 “더 궁금한 점이 있으시면 언제든 질문해 주세요.”와 같이 대화를 이어갈 여지를 남기세요.
"""
    user_prompt = f"문서: {context}\n질문: {question}\n위 문서들을 참고해서 질문에 답변해줘."
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    input_ids = midm_tokenizer.apply_chat_template(
        messages,
        tokenize=True,
        add_generation_prompt=True,
        return_tensors="pt"
    ).to("cuda")

    output = midm_model.generate(
        input_ids=input_ids,
        max_new_tokens=1024,
        do_sample=True,
        temperature=0.8,
        top_p=0.75,
        top_k=20,
        pad_token_id=midm_tokenizer.pad_token_id,
        eos_token_id=midm_tokenizer.eos_token_id
    )
    return midm_tokenizer.decode(output[0], skip_special_tokens=True)


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
    system_prompt = "당신은 검색을 잘 하기 위한 질문 재작성 전문가입니다."
    user_prompt = (
        f"원본 질문: {state['question']}\n"
        "위 질문의 핵심 의미는 유지하면서, 유사 문서를 더 잘 찾을 수 있도록 검색 최적화된 형태로 다시 써줘."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    input_ids = midm_tokenizer.apply_chat_template(
        messages,
        tokenize=True,
        add_generation_prompt=True,
        return_tensors="pt"
    ).to("cuda")

    output = midm_model.generate(
        input_ids=input_ids,
        max_new_tokens=128,
        do_sample=True,
        temperature=0.7,
        top_p=0.9,
        top_k=50,
        pad_token_id=midm_tokenizer.pad_token_id,
        eos_token_id=midm_tokenizer.eos_token_id
    )

    rewritten_question = midm_tokenizer.decode(output[0], skip_special_tokens=True)

    print("\n[query_rewrite_node] Rewritten Question:", rewritten_question)

    return {
        "question": rewritten_question.strip(),
        "retriever_docs": [],
        "score": 0.0,
        "answer": ""
    }


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
