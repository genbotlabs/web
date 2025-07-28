import httpx, os, io
from fastapi import WebSocket
from models.voicelog import VoiceLog
from models.session import Session as SessionModel
from datetime import datetime
from services.session.utils import text_to_speech, get_next_turn
from dotenv import load_dotenv

# load_dotenv()

RUNPOD_STREAMING_STT_URL = os.getenv("RUNPOD_STREAMING_STT_URL")

async def handle_streaming_voice(session_id: str, websocket: WebSocket):
    async with httpx.AsyncClient(timeout=30) as client:
        async for chunk in websocket.iter_bytes():
            try:
                # 1. RunPod STT 요청 (chunk 전송)
                resp = await client.post(
                    RUNPOD_STREAMING_STT_URL,
                    files={"audio": ("stream_chunk.webm", chunk, "audio/webm")}
                )
                resp.raise_for_status()
                text = resp.json().get("text", "").strip()

                # 2. sLLM에 텍스트 전달
                turn = get_next_turn(session_id)
                sllm_resp = await client.post(
                    f"http://localhost:3000/{session_id}/sllm",
                    json={"session_id": session_id, "turn": turn, "content": text}
                )
                sllm_resp.raise_for_status()
                answer = sllm_resp.json().get("content", "").strip()

                # 3. TTS 변환
                tts_audio = text_to_speech(answer)

                # 4. WebSocket으로 음성 전송
                await websocket.send_bytes(tts_audio.read())

            except Exception as e:
                await websocket.send_text(f"Error: {str(e)}")
