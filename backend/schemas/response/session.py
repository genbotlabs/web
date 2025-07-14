from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime

# 세션 생성 응답
class CreateSessionResponse(BaseModel):
    session_id: str = Field(..., example="session_abc123")
    created_at: datetime = Field(..., example="2025-07-14T13:00:00Z")

# 메시지
class MessageItemResponse(BaseModel):
    sender: Literal["user", "bot"] = Field(..., example="user")
    message: str
    timestamp: datetime
    message_type: Literal["text", "voice"]