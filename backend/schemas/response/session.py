from pydantic import BaseModel, Field
from typing import Literal, List
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

# 전체 메시지 목록 응답
class MessageListResponse(BaseModel):
    session_id: str = Field(..., example="session_abc123")
    messages: List[MessageItemResponse]

# 단일 메시지 응답
class SendMessageResponse(BaseModel):
    response_message: str = Field(..., example="문의하신 내용을 확인했습니다.")
    timestamp: datetime = Field(..., example="2025-07-14T13:02:00Z")