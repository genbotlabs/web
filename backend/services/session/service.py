from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from uuid import uuid4
from datetime import datetime

from models.session import Session as SessionModel
from models.chatlog import ChatLog
from schemas.request.session import CreateSessionRequest, SendMessageRequest
from schemas.response.session import (
    CreateSessionResponse, SendMessageResponse,
    MessageItemResponse, MessageListResponse, EndSessionResponse
)

# 1. 세션 생성
async def create_session_service(request: CreateSessionRequest, db: AsyncSession) -> CreateSessionResponse:
    session_id = f"session_{uuid4().hex[:8]}"

    session = SessionModel(
        session_id=session_id,
        bot_id=request.bot_id
    )
    db.add(session)
    await db.commit()

    return CreateSessionResponse(session_id=session_id)


# 2. 메시지 전송 (텍스트)
async def send_message_service(session_id: str, request: SendMessageRequest, db: AsyncSession) -> SendMessageResponse:
    result = await db.execute(select(SessionModel).where(SessionModel.session_id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    message = ChatLog(
        session_id=session_id,
        turn=1,
        role="user",
        content=request.message
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)

    message_response = MessageItemResponse(
        sender="user",
        message=request.message,
        timestamp=message.created_at,
        message_type=request.message_type
    )

    return SendMessageResponse(session_id=session_id, message=message_response)


# 3. 세션 기록 전체 조회
async def get_session_messages_service(session_id: str, db: AsyncSession) -> MessageListResponse:
    result = await db.execute(select(SessionModel).where(SessionModel.session_id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    result = await db.execute(select(ChatLog).where(ChatLog.session_id == session_id).order_by(ChatLog.created_at))
    chatlogs = result.scalars().all()

    messages = [
        MessageItemResponse(
            sender=log.role,
            message=log.content,
            timestamp=log.created_at,
            message_type="text"
        ) for log in chatlogs
    ]

    return MessageListResponse(session_id=session_id, messages=messages)


# 4. 세션 종료
async def end_session_service(session_id: str, db: AsyncSession) -> EndSessionResponse:
    result = await db.execute(select(SessionModel).where(SessionModel.session_id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.delete(session)
    await db.commit()

    return EndSessionResponse(success=True, message="세션이 성공적으로 종료되었습니다.")


# 5. STT 음성 메시지 전송
async def send_voice_message_service(session_id: str, request: SendMessageRequest, db: AsyncSession) -> SendMessageResponse:
    result = await db.execute(select(SessionModel).where(SessionModel.session_id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    message = ChatLog(
        session_id=session_id,
        turn=1,
        role="user",
        content=request.message
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)

    message_response = MessageItemResponse(
        sender="user",
        message=request.message,
        timestamp=message.created_at,
        message_type="voice"
    )

    return SendMessageResponse(session_id=session_id, message=message_response)
