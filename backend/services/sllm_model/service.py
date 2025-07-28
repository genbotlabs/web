from services.sllm_model.utils import app_graph
from models.chatlog import ChatLog
from models.voicelog import VoiceLog
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import traceback

async def run_sllm_answer(session_id: str, question: str, turn: int, session: AsyncSession, mode: str = "chat") -> str:
    """
    LangGraph 실행 + DB 저장
    - mode: "chat"이면 ChatLog에 저장, "voice"면 VoiceLog에 저장
    """
    try: # langgraph 답변 answer 
        result = app_graph.invoke({
            "question": question,
            "answer": ""
        })
        content = result.get("answer", "")

        # 로그 모델 선택
        LogModel = ChatLog if mode == "chat" else VoiceLog

        log_entry = LogModel(
            session_id=session_id,
            turn=turn,
            role="bot",
            content=content,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(log_entry)
        await session.commit()

        return content

    except Exception as e:
        print(f"❌ SLLM 처리 중 오류: {e}")
        traceback.print_exc()
        return "죄송합니다. 답변 생성 중 오류가 발생했습니다."
