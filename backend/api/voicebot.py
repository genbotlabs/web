from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.session.voicebot import handle_streaming_voice

router = APIRouter()

@router.websocket("/ws/voice/{session_id}")
async def voice_stream(session_id: str, websocket: WebSocket):
    await websocket.accept()
    try:
        await handle_streaming_voice(session_id, websocket)
    except WebSocketDisconnect:
        print(f"[Disconnected] session_id={session_id}")
