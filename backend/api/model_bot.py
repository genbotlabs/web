from fastapi import APIRouter
from schemas.request.model_bot import ChatRequest
from schemas.response.model_bot import ChatResponse
from services.sllm_model.service import run_sllm_answer
# from services.bot.service import run_langgraph_answer

router = APIRouter()

@router.post("/{session_id}/sllm", response_model=ChatResponse)
async def return_answer(req: ChatRequest):
    """
    사용자 질문을 받아 LangGraph 모델로부터 응답을 생성하는 API
    """
    answer = await run_sllm_answer(
        session_id=req.session_id,
        content=req.content,
        turn=req.turn,
    )
    return ChatResponse(
        session_id=req.session_id,
        turn=req.turn,
        role="assistant",
        content=answer
    )
