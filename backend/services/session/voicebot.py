import httpx, os, io
import websockets
import asyncio
import json
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
    print(f"▶▶▶ WebSocket 연결됨: session_id={session_id}")

    # 1. RunPod STT WebSocket 연결
    async with websockets.connect(RUNPOD_STREAMING_STT_URL, ping_interval=None, max_size=5 * 1024 * 1024) as stt_ws:
        async def forward_audio_chunks():
            # 프론트에서 chunk를 받아 RunPod로 전송
            try:
                while True:
                    chunk = await websocket.receive_bytes()
                    await stt_ws.send(chunk)
                    print(f"📤 [프론트→RunPod] 청크 전송: {len(chunk)} bytes")
            except WebSocketDisconnect:
                print(f"[Disconnected] session_id={session_id}")
                await stt_ws.close()
            except Exception as e:
                print("[Chunk Forward Error]", e)
                await stt_ws.close()

        async def receive_stt_and_respond():
            # RunPod에서 STT 결과(문장)이 오면 LLM→TTS→프론트로 음성 전달
            try:
                async for msg in stt_ws:
                    if not msg:
                        continue
                    try:
                        resp = json.loads(msg)
                        text = resp.get("text", "").strip()
                        print("📝 [STT 문장]", text)
                        if not text:
                            continue
                    except Exception as err:
                        print("[STT Parsing Error]", err)
                        continue

                    # DB 저장
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

                    # sLLM에 텍스트 전달
                    async with httpx.AsyncClient(timeout=60) as client:
                        sllm_resp = await client.post(
                            f"https://bynve3gvz0rw60-7860.proxy.runpod.net/chat",
                            # json={"session_id": session_id, "turn": turn, "role": "user", "content": text}
                            json={"content": text}
                        )
                        sllm_resp.raise_for_status()
                        answer = sllm_resp.json().get("content", "").strip()
                        print("🤖 [sLLM 응답]", answer)

                        # TTS 변환 및 프론트로 음성 전송
                        tts_audio = text_to_speech(answer)
                        await websocket.send_bytes(tts_audio.read())

            except Exception as e:
                print("[STT→응답 Error]", e)
                await websocket.close()

        # 병렬 실행: chunk 중계 & STT결과처리
        await asyncio.gather(
            forward_audio_chunks(),
            receive_stt_and_respond()
        )
