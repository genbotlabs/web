from pydantic import BaseModel, Field
from typing import Literal

# 세션 생성 요청
class CreateSessionRequest(BaseModel):
    bot_id: str = Field(..., example="bot_001", description="상담을 시작할 대상 봇 ID")

# 메시지 전송 요청
class SendMessageRequest(BaseModel):
    message: str = Field(..., example="화장실은 어디에 있나요?")
    message_type: Literal["text", "voice"] = Field("text", example="text")