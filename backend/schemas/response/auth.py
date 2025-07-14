from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserInfo(BaseModel):
    user_id: str = Field(..., example="user_123")
    social_id: str = Field(..., example="social_123")
    password: Optional[str] = Field(None, example="secretkey", description="사용자의 비밀번호")
    nickname: Optional[str] = Field(None, example="유경", description="사용자의 닉네임")
    profile_image: Optional[str] = Field(None, example="https://cdn.example.com/profile.jpg")
    provider: str = Field(..., example="kakao", description="소셜 로그인 제공자 (kakao, google, naver)")
    created_at: Optional[datetime] = Field(None, example="2025-07-14T10:00:00Z")
    updated_at: Optional[datetime] = Field(None, example="2025-07-14T10:05:00Z")