from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from services.session.voicebot import handle_streaming_voice
from services.get_db import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

@router.websocket("/ws/voice/{session_id}")
async def voice_stream(session_id: str, websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    await websocket.accept()
    try:
        await handle_streaming_voice(session_id, websocket)
    except WebSocketDisconnect:
        print(f"[Disconnected] session_id={session_id}")
