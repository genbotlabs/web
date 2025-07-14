from pydantic import BaseModel, Field
from typing import Optional

class SocialLoginRequest(BaseModel):
    provider: str = Field(..., example="kakao", description="소셜 로그인 제공자 (kakao, google, naver)")
    access_token: str = Field(..., example="access_token", description="소셜 플랫폼에서 발급받은 액세스 토큰")