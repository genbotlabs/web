from pydantic import BaseModel, Field
from typing import List, Optional, datetime


class BotDataInfo(BaseModel):
    data_id: str = Field(..., example="data_001")
    filename: str = Field(..., example="faq.pdf")
    type: int = Field(..., example=0, description="파일 타입 (예: 0: json, 1: pdf)")
    storage_url: str = Field(..., example="https://storage.example.com/faq.pdf")
    
class UploadedFileInfo(BaseModel):
    data_id: str = Field(..., example="data_001")
    filename: str = Field(..., example="faq.pdf")
    type: int = Field(..., example=0, description="파일 타입 (예: 0: json, 1: pdf)")
    storage_url: str = Field(..., example="https://storage.example.com/faq.pdf")
    uploaded_at: datetime = Field(..., example="2025-07-14T12:01:00Z")

class BotCreateRequest(BaseModel):
    company_name: str = Field(..., example="GenBot")
    usage: str = Field(..., example="문의")
    first_text: str = Field(..., example="안녕하세요! GenBot의 문의봇입니다.")
    email: str = Field(..., example="user@example.com")
    cs_number: str = Field(..., example="1522-0000")
    data: List[BotDataInfo]

class BotUpdateRequest(BaseModel):
    company_name: Optional[str] = Field(None, example="GenBot Inc.")
    usage: Optional[str] = Field(None, example="업무 자동화")
    first_text: Optional[str] = Field(None, example="무엇을 도와드릴까요?")
    email: Optional[str] = Field(None, example="support@genbot.com")
    cs_number: Optional[str] = Field(None, example="1544-1234")

class UploadedFileResponse(BaseModel):
    files: List[UploadedFileInfo]

# 임시
class DataValidationRequest(BaseModel):
    file_names: List[str] = Field(..., example=["faq.pdf", "test.json"])
  