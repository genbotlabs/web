from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from schemas.request.session import CreateSessionRequest, SendMessageRequest
from schemas.response.session import (
    CreateSessionResponse, SendMessageResponse,
    MessageListResponse, EndSessionResponse
)
from services.session.chatbot import (
    create_session_service,
    send_message_service,
    get_session_messages_service,
    end_session_service,
    req_sllm_service
)

import os
from dotenv import load_dotenv

from services.get_db import get_db

load_dotenv()

router = APIRouter()

# 1. 세션 생성
@router.post("/{bot_id}", response_model=CreateSessionResponse)
async def create_session(
    bot_id: str,
    db: AsyncSession = Depends(get_db)
):
    print('>>>>>>', '세션 생성')
    return await create_session_service(bot_id, db)

# 2. 메시지 전송 (텍스트)
@router.post("/{session_id}/messages", response_model=SendMessageResponse)
async def send_message(
    session_id: str,
    request: SendMessageRequest,
    db: AsyncSession = Depends(get_db)
):
    return await send_message_service(session_id, request, db)

# 3. 세션 기록 전체 조회
@router.get("/{session_id}/messages", response_model=MessageListResponse)
async def get_session_messages(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await get_session_messages_service(session_id, db)

# 4. 세션 종료
@router.delete("/{session_id}", response_model=EndSessionResponse)
async def end_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await end_session_service(session_id, db)
