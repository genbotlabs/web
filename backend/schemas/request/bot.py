from pydantic import BaseModel, Field


class BotDataItem(BaseModel):
    data_id: str = Field(..., example="data_001")
    filename: str = Field(..., example="faq.pdf")
    type: int = Field(..., example=0, description="파일 타입 (예: 0: json, 1: pdf)")
    storage_url: str = Field(..., example="https://storage.example.com/faq.pdf")