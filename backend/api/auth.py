from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import urllib.parse
from fastapi.responses import RedirectResponse
from fastapi import Response

from schemas.request.auth import (
    SocialLoginRequest, LogoutRequest, UserUpdateRequest, UserDeleteRequest
)
from schemas.response.auth import (
    LoginResponse, LogoutResponse, UserMeResponse, UserDeleteResponse
)
from services.auth.service import (
    kakao_social_login, google_social_login, naver_social_login
)
from services.get_db import get_db


router = APIRouter()

@router.get("/login/kakao", response_model=LoginResponse)
async def kakao_login(code: str, session: AsyncSession = Depends(get_db)):
    user = await kakao_social_login(code, session)
    
    query = urllib.parse.urlencode({
        "user_id": user.user.user_id,
        "nickname": user.user.nickname,
        "profile_image": user.user.profile_image
    })
    return RedirectResponse(f"http://localhost:3000/?{query}")

@router.get("/login/google", response_model=LoginResponse)
async def google_login(code: str, session: AsyncSession = Depends(get_db)):
    user = await google_social_login(code, session)
    
    query = urllib.parse.urlencode({
        "user_id": user.user.user_id,
        "nickname": user.user.nickname,
        "profile_image": user.user.profile_image
    })
    return RedirectResponse(f"http://localhost:3000/?{query}")

@router.get("/login/naver", response_model=LoginResponse)
async def naver_login(code: str, state: str, session: AsyncSession = Depends(get_db)):
    user = await naver_social_login(code, state, session)
    print(">>>>>>>>>>>.")
    print(user)
    query = urllib.parse.urlencode({
        "access_token": user.access_token,
        "refresh_token": user.refresh_token,
        "user_id": user.user.user_id,
        "nickname": user.user.nickname,
        "profile_image": user.user.profile_image
    })
    return RedirectResponse(f"http://localhost:3000/?{query}")

@router.post("/logout", response_model=UserDeleteResponse)
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return UserDeleteResponse(success=True, message="로그아웃 완료")