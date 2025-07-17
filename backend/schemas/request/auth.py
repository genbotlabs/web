from pydantic import BaseModel, Field
from typing import Optional

# 소셜 로그인 요청
class SocialLoginRequest(BaseModel):
    provider: str = Field(..., example="kakao", description="소셜 로그인 제공자 (kakao, google, naver)")
    
# 로그아웃 요청
class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., example="refresh_token", description="로그아웃할 사용자의 리프레시 토큰")

# 회원 정보 수정 요청   
class UserUpdateRequest(BaseModel):
    nickname: Optional[str] = Field(None, example="닉네임", description="수정할 닉네임")
    profile_image: Optional[str] = Field(None, example="https://cdn.example.com/profile.jpg", description="프로필 이미지 URL")

# 회원 탈퇴 요청
class UserDeleteRequest(BaseModel):
    confirm: bool = Field(..., example=True, description="정말 탈퇴하시겠습니까?")
