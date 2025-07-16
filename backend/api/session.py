from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from contextlib import asynccontextmanager

from schemas.request.session import CreateSessionRequest, SendMessageRequest
from schemas.response.session import (
    CreateSessionResponse, SendMessageResponse,
    MessageListResponse, EndSessionResponse
)
from services.session.service import (
    create_session_service,
    send_message_service,
    get_session_messages_service,
    end_session_service,
    send_voice_message_service
)

import os
from dotenv import load_dotenv

load_dotenv()


# 의존성 관리 코드 포함
DATABASE_URL = os.getenv(GENBOTDB_LOCAL_URL)  # 실제 환경에 맞게 수정
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)

@asynccontextmanager
async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session

router = APIRouter()

# 1. 세션 생성
@router.post("/sessions", response_model=CreateSessionResponse)
async def create_session(
    request: CreateSessionRequest,
    db: AsyncSession = Depends(get_async_db)
):
    return await create_session_service(request, db)

# 2. 메시지 전송 (텍스트)
@router.post("/sessions/{session_id}/messages", response_model=SendMessageResponse)
async def send_message(
    session_id: str,
    request: SendMessageRequest,
    db: AsyncSession = Depends(get_async_db)
):
    return await send_message_service(session_id, request, db)

# 3. 세션 기록 전체 조회
@router.get("/sessions/{session_id}/messages", response_model=MessageListResponse)
async def get_session_messages(
    session_id: str,
    db: AsyncSession = Depends(get_async_db)
):
    return await get_session_messages_service(session_id, db)

# 4. 세션 종료
@router.delete("/sessions/{session_id}", response_model=EndSessionResponse)
async def end_session(
    session_id: str,
    db: AsyncSession = Depends(get_async_db)
):
    return await end_session_service(session_id, db)

# 5. STT 음성 메시지 전송
@router.post("/sessions/{session_id}/speech", response_model=SendMessageResponse)
async def send_voice_message(
    session_id: str,
    request: SendMessageRequest,
    db: AsyncSession = Depends(get_async_db)
):
    return await send_voice_message_service(session_id, request, db)