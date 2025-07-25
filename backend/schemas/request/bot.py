from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional


# 데이터 목록
class BotDataItemRequest(BaseModel):
    data_id: int = Field(..., example="1")
    filename: str = Field(..., example="faq.pdf")
    # type: int = Field(..., example=0, description="파일 타입 (예: 0: json, 1: pdf)")
    storage_url: str = Field(..., example="https://storage.example.com/faq.pdf")

# 봇 생성 요청
class BotCreateRequest(BaseModel):
    user_id: int = Field(..., example="1"),
    company: str = Field(..., example="GenBot"),
    bot_name: str = Field(..., example="문의"),
    email: str = Field(..., example="user@example.com"),
    consultant_number: str = Field(..., example="1522-0000"),
    greeting: str = Field(..., example="안녕하세요! GenBot의 문의봇입니다."),
    files: List[BotDataItemRequest]

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
