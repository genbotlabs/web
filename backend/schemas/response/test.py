from pydantic import BaseModel, Field
from datetime import datetime


# 봇 테스트 응답
class BotTestResponse(BaseModel):
    response_message: str = Field(..., example="오늘 영업합니다.")
    timestamp: datetime = Field(..., example="2025-07-14T14:10:00Z")