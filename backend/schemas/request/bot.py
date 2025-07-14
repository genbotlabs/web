from pydantic import BaseModel, Field
from typing import List, datetime


class BotDataItem(BaseModel):
    data_id: str = Field(..., example="data_001")
    filename: str = Field(..., example="faq.pdf")
    type: int = Field(..., example=0, description="파일 타입 (예: 0: json, 1: pdf)")
    storage_url: str = Field(..., example="https://storage.example.com/faq.pdf")
    
class BotDetailResponse(BaseModel):
    bot_id: str = Field(..., example="bot_001")
    company_name: str = Field(..., example="GenBot")
    usage: str = Field(..., example="문의")
    first_text: str = Field(..., example="안녕하세요! GenBot의 문의봇입니다.")
    email: str = Field(..., example="user@example.com")
    cs_number: str = Field(..., example="1522-0000")
    data: List[BotDataItem]
    created_at: datetime = Field(..., example="2025-07-14T12:00:00Z")
    updated_at: datetime = Field(..., example="2025-07-14T12:10:00Z")