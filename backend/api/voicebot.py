from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

# from services.session.voicebot import voicebot_service

from dotenv import load_dotenv

from services.get_db import get_db

load_dotenv()

router = APIRouter()

# 1. STT: 음성 → 텍스트
# @router.post("/{session_id}/voice")
# async def voicebot_api(
#     session_id: str,
#     audio: UploadFile = File(...),
#     db: AsyncSession = Depends(get_db)
# ):
#     return await voicebot_service(session_id, audio, db)

# # 2. TTS: 텍스트 → 음성
# @router.get("/{session_id}/tts")
# async def trans_tts_api(
#     session_id: str,
#     content: str = Query(...),
#     db: AsyncSession = Depends(get_db)
# ):
#     return StreamingResponse(audio_stream, media_type="audio/mpeg")
