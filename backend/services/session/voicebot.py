from datetime import datetime
from sqlalchemy import func, select
from models.voicelog import VoiceLog
from models.session import Session as SessionModel
from fastapi import HTTPException, UploadFile, Query
from fastapi.responses import JSONResponse, StreamingResponse
from services.session.utils import text_to_speech, whisper_pipe
import tempfile
from dotenv import load_dotenv

load_dotenv()

# 1. STT 서비스 (음성→텍스트)
async def load_stt_service(session_id: str, audio: UploadFile, db):
    # 세션 존재 확인
    result = await db.execute(select(SessionModel).where(SessionModel.session_id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    turn_result = await db.execute(
        select(func.max(VoiceLog.turn)).where(VoiceLog.session_id == session_id)
    )
    turn = (turn_result.scalar_one() or 0) + 1

    # Whisper로 STT
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        tmp.write(audio.file.read())
        tmp.flush()
        segments, info = whisper_pipe.transcribe(tmp.name, language="ko")
        text = "".join([seg.text for seg in segments])

    # VoiceLog 저장 (선택)
    now = datetime.utcnow()
    user_voice = VoiceLog(
        session_id=session_id, turn=turn, role="user", content=text, created_at=now, updated_at=now
    )
    db.add(user_voice)
    await db.commit()
    await db.refresh(user_voice)

    return JSONResponse({"session_id": session_id, "text": text})

# 2. TTS 서비스 (텍스트→음성)
async def trans_tts_service(session_id: str, text: str):
    audio_stream = text_to_speech(text)
    return StreamingResponse(audio_stream, media_type="audio/mpeg")
