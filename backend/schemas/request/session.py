from pydantic import BaseModel, Field


class CreateSessionRequest(BaseModel):
    bot_id: str = Field(..., example="bot_001", description="상담을 시작할 대상 봇 ID")