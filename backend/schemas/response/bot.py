from pydantic import BaseModel, Field
from typing import List
from datetime import datetime


# 데이터 메타 정보
class BotDataItemResponse(BaseModel):
    data_id: str = Field(..., example="data_001")
    filename: str = Field(..., example="faq.pdf")
    type: int = Field(..., example=0, description="파일 타입 (예: 0: json, 1: pdf)")
    storage_url: str = Field(..., example="https://storage.example.com/faq.pdf")

# 봇 상세
class BotDetailItem(BaseModel):
    bot_id: str = Field(..., example="bot_001")
    company_name: str = Field(..., example="GenBot")
    usage: str = Field(..., example="문의")
    first_text: str = Field(..., example="안녕하세요! GenBot의 문의봇입니다.")
    email: str = Field(..., example="user@example.com")
    cs_number: str = Field(..., example="1522-0000")
    data: List[BotDataItemResponse]
    created_at: datetime = Field(..., example="2025-07-14T12:00:00Z")
    updated_at: datetime = Field(..., example="2025-07-14T12:10:00Z")

# 봇 생성
# 봇 상세 조회
# 봇 수정
class BotDetailResponse(BaseModel):
    bot: BotDetailItem

# 봇 목록 조회
class BotListResponse(BaseModel):
    bots: List[BotDetailItem]

# 데이터 상세 조회
class UploadedDataDetailResponse(BaseModel):
    file: BotDataItemResponse

# 데이터 목록 조회
class UploadedDataListResponse(BaseModel):
    files: List[BotDataItemResponse]

# 봇 삭제
class BotDeleteResponse(BaseModel):
    success: bool = Field(..., example=True)
    message: str = Field(..., example="상담봇이 성공적으로 삭제되었습니다.")