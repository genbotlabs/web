# api/voicebot.py
from fastapi import APIRouter, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from services.get_db import get_db
from services.session.voicebot import process_voice_upload

router = APIRouter()

@router.post("/voicebot")
async def upload_voice_api(
    file: UploadFile = File(...),
    bot_id: str = Form(...),
    session_id: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    tts_audio = await process_voice_upload(file, bot_id, session_id, db)

    # 오디오를 파일로 보내려면 StreamingResponse 사용:
    return StreamingResponse(tts_audio, media_type="audio/wav")
