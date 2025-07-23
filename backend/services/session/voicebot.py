import os, httpx, io, tempfile
from datetime import datetime
from sqlalchemy import func, select
from models.voicelog import VoiceLog
from models.session import Session as SessionModel
from fastapi import HTTPException, UploadFile, Query
from fastapi.responses import JSONResponse, StreamingResponse
from services.session.utils import text_to_speech, whisper_pipe, vad_librosa
import tempfile 
import shutil
from dotenv import load_dotenv

load_dotenv()

# 1. STT 서비스 (음성→텍스트)
async def voicebot_service(session_id: str, audio: UploadFile, db):
    # 세션 존재 확인
    result = await db.execute(select(SessionModel).where(SessionModel.session_id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    turn_result = await db.execute(
        select(func.max(VoiceLog.turn)).where(VoiceLog.session_id == session_id)
    )
    turn = (turn_result.scalar_one() or 0) + 1

    # 2. Whisper + librosa VAD
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_in:
        shutil.copyfileobj(audio.file, tmp_in)
        tmp_in_path = tmp_in.name
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_vad:
        tmp_vad_path = tmp_vad.name

    try:
        # 2. VAD 적용 (이제 임시파일은 모두 닫힌 상태)
        vad_ok = vad_librosa(tmp_in_path, tmp_vad_path)
        if not vad_ok:
            content = ""
        else:
            stt_result = whisper_pipe(tmp_vad_path)
            content = stt_result["text"]
    finally:
        # 임시파일 삭제(안전하게)
        if os.path.exists(tmp_in_path):
            os.remove(tmp_in_path)
        if os.path.exists(tmp_vad_path):
            os.remove(tmp_vad_path)

    # 3. VoiceLog 저장
    now = datetime.utcnow()
    user_voice = VoiceLog(
        session_id=session_id, 
        turn=turn, 
        role="user", 
        content=content, 
        created_at=now, 
        updated_at=now
    )
    db.add(user_voice)
    await db.commit()
    await db.refresh(user_voice)

# 4. SLLM(LLM) API로 질문 전달 → 답변 받기
    async with httpx.AsyncClient() as client:
        sllm_resp = await client.post(
            "http://localhost:3000/{session_id}/sllm",
            json={
                "session_id": session_id,
                "content": content,
                "turn": turn
            }
        )
        sllm_resp.raise_for_status()
        sllm_data = sllm_resp.json()
        answer_text = sllm_data.get("answer", "")

        # 5. VoiceLog에 답변 저장 (bot role)
        # bot_voice = VoiceLog(
        #     session_id=session_id, 
        #     turn=turn, 
        #     role="bot",
        #     content=answer_text, 
        #     created_at=now, 
        #     updated_at=now
        # )
        # db.add(bot_voice)
        # await db.commit()
        # await db.refresh(bot_voice)

        # 6. TTS (OpenAI 등 직접 함수 호출)
        audio_stream = text_to_speech(answer_text)

    # 7. 음성 파일로 응답 (StreamingResponse)
    return StreamingResponse(audio_stream, media_type="audio/mpeg")

