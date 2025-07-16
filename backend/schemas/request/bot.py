from pydantic import BaseModel, Field
from typing import List, Optional
from pydantic import EmailStr


# 데이터 목록
class BotDataItemRequest(BaseModel):
    data_id: str = Field(..., example="data_001")
    filename: str = Field(..., example="faq.pdf")
    type: int = Field(..., example=0, description="파일 타입 (예: 0: json, 1: pdf)")
    storage_url: str = Field(..., example="https://storage.example.com/faq.pdf")

# 봇 생성 요청
class BotCreateRequest(BaseModel):
    company_name: str = Field(..., example="GenBot")
    usage: str = Field(..., example="문의")
    first_text: str = Field(..., example="안녕하세요! GenBot의 문의봇입니다.")
    email: EmailStr = Field(..., example="user@example.com")
    cs_number: str = Field(..., example="1522-0000")
    data: List[BotDataItemRequest]

# 봇 수정 요청
class BotUpdateRequest(BaseModel):
    company_name: Optional[str] = Field(None, example="GenBot1")
    usage: Optional[str] = Field(None, example="업무 문의")
    first_text: Optional[str] = Field(None, example="안녕하세요. 무엇을 도와드릴까요?")
    email: Optional[EmailStr] = Field(None, example="update@example.com")
    cs_number: Optional[str] = Field(None, example="1544-0000")
    data: Optional[List[BotDataItemRequest]]

# 임시
class DataValidationRequest(BaseModel):
    file_names: List[str] = Field(..., example=["faq.pdf", "test.json"])
