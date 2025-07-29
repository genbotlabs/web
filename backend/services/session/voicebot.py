import httpx, os, io
from fastapi import WebSocket, WebSocketDisconnect
from models.voicelog import VoiceLog
from models.session import Session as SessionModel
from datetime import datetime
from services.session.utils import text_to_speech, get_next_turn
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession

load_dotenv()

RUNPOD_STREAMING_STT_URL = os.getenv("RUNPOD_STREAMING_STT_URL")

async def handle_streaming_voice(session_id: str, websocket: WebSocket, db: AsyncSession):
    async with httpx.AsyncClient(timeout=300) as client:
        while True:
            try:
                # 1) 클라이언트가 보낸 오디오 청크 수신
                chunk = await websocket.receive_bytes()
                print(f"▶▶▶ 서버가 받은 chunk 크기: {len(chunk)}")
            except WebSocketDisconnect:
                print(f"[Disconnected] session_id={session_id}")
                break

            try:
                # 1. RunPod STT 요청 (chunk 전송)
                print("▶▶▶ STT 요청 시작")
                resp = await client.post(
                    RUNPOD_STREAMING_STT_URL,
                    files={"audio": ("stream_chunk.webm", chunk, "audio/webm")}
                )
                resp.raise_for_status()
                text = resp.json().get("text", "").strip()
                print('>>>>>> 사용자 음성',text)

                # 2. sLLM에 텍스트 전달 및 응답 받기
                print('>>>>>> sLLM 응답 전 ')
                turn = get_next_turn(session_id, sender="user")

                user_voice = VoiceLog(
                    session_id=session_id,
                    turn=turn,
                    role="user",
                    content=text,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(user_voice)
                await db.commit()

                sllm_resp = await client.post(
                    f"http://localhost:3000/{session_id}/sllm",
                    json={"session_id": session_id, "turn": turn, "role" : "user", "content": text}
                )
                sllm_resp.raise_for_status()
                answer = sllm_resp.json().get("content", "").strip()
                print('>>>>>> sLLM 응답',answer)

                # 3. TTS 변환
                tts_audio = text_to_speech(answer)

                # 4. WebSocket으로 음성 전송
                await websocket.send_bytes(tts_audio.read())

            except Exception as e:
                await websocket.send_text(f"Error: {str(e)}")
