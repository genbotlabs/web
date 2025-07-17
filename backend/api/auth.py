from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import urllib.parse
from fastapi.responses import RedirectResponse

from schemas.request.auth import (
    SocialLoginRequest, LogoutRequest, UserUpdateRequest, UserDeleteRequest
)
from schemas.response.auth import (
    LoginResponse, LogoutResponse, UserMeResponse, UserDeleteResponse
)
from services.auth.service import (
    kakao_social_login
)
from services.get_db import get_db


router = APIRouter()

@router.get("/login/kakao", response_model=LoginResponse)
async def login(code: str, session: AsyncSession = Depends(get_db)):
    user = await kakao_social_login(code, session)
    
    query = urllib.parse.urlencode({
        "user_id": user.user.user_id,
        "nickname": user.user.nickname,
        "profile_image": user.user.profile_image
    })
    return RedirectResponse(f"http://localhost:3000/?{query}")
