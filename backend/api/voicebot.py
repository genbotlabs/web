from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from contextlib import asynccontextmanager

from schemas.request.session import CreateSessionRequest, SendMessageRequest
from schemas.response.session import (SendMessageResponse, MessageListResponse)
from web.backend.services.session.chatbot import (
    send_message_service,
    get_session_messages_service
)

from services.session.voicebot import load_stt_service, trans_tts_service

import os
from dotenv import load_dotenv

from services.get_db import get_db

load_dotenv()

router = APIRouter()

# 1. STT: 음성 → 텍스트
@router.post("/{session_id}/stt")
async def load_stt_api(
    session_id: str,
    audio: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    return await load_stt_service(session_id, audio, db)

# 2. TTS: 텍스트 → 음성
@router.get("/{session_id}/tts")
async def trans_tts_api(
    session_id: str,
    text: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    return await trans_tts_service(session_id, text, db)
# stt불러오는 api s3에 요청 껍데기
# 로컬에 있는 걸로 stt해보기