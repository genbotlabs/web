import os
import httpx
from fastapi import HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User
from services.auth.user import get_or_create_user
from services.get_db import get_db
from schemas.request.auth import (
    SocialLoginRequest, LogoutRequest, UserUpdateRequest, UserDeleteRequest
)
from schemas.response.auth import (
    UserInfo, LoginResponse, LogoutResponse, UserMeResponse, UserDeleteResponse
)
from services.auth.utils import create_access_token, create_refresh_token


async def kakao_social_login(code: str, session: AsyncSession) -> LoginResponse:
    
    token_url = "https://kauth.kakao.com/oauth/token"
    token_data = {
        "grant_type": "authorization_code",
        "client_id": os.getenv("KAKAO_REST_API_KEY"),
        "redirect_uri": os.getenv("KAKAO_REDIRECT_URI"),
        "code": code,
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=token_data)
        token_json = token_res.json()

    access_token = token_json.get("access_token")
    if not access_token:
        return {"error": "카카오 토큰 오류", "detail": token_json}
    
    user_info_url = "https://kapi.kakao.com/v2/user/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(user_info_url, headers=headers)
        

    try:
        kakao_info = response.json()
        print("카카오 유저 정보:", kakao_info)
        kakao_id = str(kakao_info["id"])
        nickname = kakao_info["properties"]["nickname"]
        profile_image = kakao_info["properties"].get("profile_image", None)

        # DB에서 사용자 존재 여부 확인 또는 생성
        user: User = await get_or_create_user(session, kakao_id, nickname, profile_image, "kakao")

        # JWT 토큰 발급
        access_token = create_access_token(user.user_id)
        refresh_token = create_refresh_token(user.user_id)

        # 응답 반환
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserInfo(**user.__dict__)
        )
    except Exception as e:
        print("로그인 처리 중 에러:", e)
        raise HTTPException(status_code=500, detail=str(e))

# async def google_social_login(request: SocialLoginRequest) -> LoginResponse:
#     return LoginResponse(
#         access_token=,
#         refresh_token=,
#         user=
#     )

# async def naver_social_login(request: SocialLoginRequest) -> LoginResponse:
#     return LoginResponse(
#         access_token=,
#         refresh_token=,
#         user=
#     )