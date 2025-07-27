from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.request.model_bot import ChatRequest
from schemas.response.model_bot import ChatResponse
from services.sllm_model.service import run_sllm_answer
from services.get_db import get_db

router = APIRouter()

# ✅ 공통 unified endpoint (선택 사항)
@router.post("/{session_id}/sllm", response_model=ChatResponse)
async def return_answer(
    session_id: str,
    req: ChatRequest,
    session: AsyncSession = Depends(get_db)  # ✅ 세션 주입
):
    """
    사용자 질문을 받아 LangGraph 모델로부터 응답을 생성하는 기본 API
    """
    answer = await run_sllm_answer(
        session_id=session_id,
        question=req.content,  # ✅ content → question 파라미터명 일치
        turn=req.turn,
        session=session,
        mode="chat"  # 기본은 챗봇 응답으로 처리
    )
    return ChatResponse(
        session_id=session_id,
        turn=req.turn,
        role="bot",
        content=answer
    )

# ✅ 명시적으로 챗봇 요청 처리
@router.post("/chat/{session_id}/sllm", response_model=ChatResponse)
async def chat_handler(
    session_id: str,
    req: ChatRequest,
    session: AsyncSession = Depends(get_db)
):
    answer = await run_sllm_answer(
        session_id=session_id,
        content=req.content,
        turn=req.turn,
        session=session,
        mode="chat"
    )
    return ChatResponse(
        session_id=session_id,
        turn=req.turn,
        role="bot",
        content=answer
    )

# ✅ 명시적으로 음성 요청 처리
@router.post("/voice/{session_id}/sllm", response_model=ChatResponse)
async def voice_handler(
    session_id: str,
    req: ChatRequest,
    session: AsyncSession = Depends(get_db)
):
    answer = await run_sllm_answer(
        session_id=session_id,
        content=req.content,
        turn=req.turn,
        session=session,
        mode="voice"
    )
    return ChatResponse(
        session_id=session_id,
        turn=req.turn,
        role="bot",
        content=answer
    )
