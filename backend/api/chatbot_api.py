import os
import sys

# 이 파일(chatbot_api.py)이 있는 디렉터리
HERE = os.path.dirname(__file__)

# 세 단계 상위로 올라가면 'final' 폴더가 됨
PROJECT_ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))

# 이 경로를 sys.path에 추가
sys.path.append(PROJECT_ROOT)

# 이제 models.langgraph 를 임포트할 수 있음
from models.lang_graph.lang_graph import app as langgraph_app

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],           
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    response = langgraph_app.invoke({
        "question": request.question, 
        "answer": "", 
        "score": 0.0, 
        "retriever_docs": []
    })

    return {
        "answer": response["answer"]
    }

@app.get("/")
async def root():
    return {"message": "Hello Genbot!"}
