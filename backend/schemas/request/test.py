from pydantic import BaseModel, Field


# 봇 테스트 요청
class BotTestRequest(BaseModel):
    message: str = Field(..., example="오늘 영업하시나요?")