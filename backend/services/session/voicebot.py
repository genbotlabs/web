import httpx
import os
import tempfile
import shutil
from models.voicelog import VoiceLog
from datetime import datetime
from services.session.utils import text_to_speech, get_next_turn

RUNPOD_STT_URL = os.getenv("RUNPOD_STT_URL")  # 예: http://<runpod-url>/stt
RUNPOD_SLLM_URL = os.getenv("RUNPOD_SLLM_URL")  # 예: http://<runpod-url>/chat

async def process_voice_upload(file, bot_id, session_id, db):
    # 1. 업로드된 파일을 임시로 저장
    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_webm:
        shutil.copyfileobj(file.file, tmp_webm)
        tmp_webm_path = tmp_webm.name

    try:
        # 2. RunPod의 /stt API로 전송
        with open(tmp_webm_path, "rb") as f:
            files = {'file': ('audio.webm', f, 'audio/webm')}
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(RUNPOD_STT_URL, files=files)
                resp.raise_for_status()
                stt_text = resp.json().get("text", "").strip()
                print("📝 [STT 결과]", stt_text)

        # 3. DB 저장
        turn = get_next_turn(session_id, sender="user")
        user_voice = VoiceLog(
            session_id=session_id,
            turn=turn,
            role="user",
            content=stt_text,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(user_voice)
        await db.commit()

        # 4. LLM에 질문(텍스트) 전달
        async with httpx.AsyncClient(timeout=60) as client:
            sllm_resp = await client.post(
                RUNPOD_SLLM_URL,
                json={"bot_id": bot_id, "session_id": session_id, "question": stt_text}
            )
            sllm_resp.raise_for_status()
            answer = sllm_resp.json().get("answer", "").strip()
            print("🤖 [sLLM 응답]", answer)

            # 5. TTS 변환 (오디오 파일 반환하려면 여기를 수정)
            tts_audio = text_to_speech(answer)
            tts_audio.seek(0)  # 오디오 스트림의 시작으로 이동
            return tts_audio
            # return answer, tts_audio

    finally:
        os.remove(tmp_webm_path)
