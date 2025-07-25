import os, httpx, tempfile
from datetime import datetime
from sqlalchemy import func, select
from models.voicelog import VoiceLog
from models.session import Session as SessionModel
from fastapi import HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from services.session.utils import text_to_speech, whisper_pipe
import tempfile 
import shutil
from dotenv import load_dotenv

load_dotenv()

session_turns = {}

def get_next_turn(session_id, sender):
    if sender == "user":
        session_turns[session_id] = session_turns.get(session_id, 0) + 1
    return session_turns.get(session_id, 1)

# 1. STT 서비스 (음성→텍스트)
async def voicebot_service(session_id: str, audio: UploadFile, db):
    # 세션 존재 확인
    result = await db.execute(select(SessionModel).where(SessionModel.session_id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 세션이 존재하면 turn 번호 계산
    # turn 번호는 해당 세션의 최대 turn + 1
    turn = get_next_turn(session_id, "user")

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_in:
        shutil.copyfileobj(audio.file, tmp_in)
        tmp_in_path = tmp_in.name

    try:
        # WhisperModel에서 VAD까지 한 번에 처리!
        segments, info = whisper_pipe.transcribe(
            tmp_in_path,
            language="ko",
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=1000)  # 필요에 따라 margin 등 조정
        )
        # segments는 generator이므로 리스트로 변환
        content = "".join([seg.text for seg in segments])

    finally:
        if os.path.exists(tmp_in_path):
            os.remove(tmp_in_path)

    # # 2. Whisper + librosa VAD
    # with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_in:
    #     shutil.copyfileobj(audio.file, tmp_in)
    #     tmp_in_path = tmp_in.name
    # with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_vad:
    #     tmp_vad_path = tmp_vad.name

    # try:
    #     # 2. VAD 적용 (이제 임시파일은 모두 닫힌 상태)
    #     vad_ok = vad_librosa(tmp_in_path, tmp_vad_path)
    #     if not vad_ok:
    #         content = ""
    #     else:
    #         stt_result = whisper_pipe(tmp_vad_path)
    #         content = stt_result["text"]
    # finally:
    #     # 임시파일 삭제(안전하게)
    #     if os.path.exists(tmp_in_path):
    #         os.remove(tmp_in_path)
    #     if os.path.exists(tmp_vad_path):
    #         os.remove(tmp_vad_path)

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
        answer_text = sllm_data.get("content", "")

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

