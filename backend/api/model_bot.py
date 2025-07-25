# backend/api/model_bot.py

from fastapi import APIRouter
from schemas.request.model_bot import ChatRequest
from schemas.response.model_bot import ChatResponse
#from services.bot.service import run_langgraph_answer

router = APIRouter()

@router.get("/{session_id}/sllm", response_model=ChatResponse)
async def return_answer(req: ChatRequest):
    """
    사용자 질문을 받아 langgraph 모델로부터 응답을 생성하는 API
    """
    answer = run_langgraph_answer(req.question)
    return ChatResponse(answer=answer)

# 1. 챗봇으로 사용자 질문이 들어오면 질문에 대한 답변 반환
# 2. 보이스봇으로 사용자 질문이 들어왔을 때 정원이가 만든 stt load 함수에서 텍스트를 받아서 sllm에 넣어주기
