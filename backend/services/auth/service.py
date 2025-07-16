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


KAKAO_USER_INFO_URL = os.getenv('KAKAO_USER_INFO_URL')

async def kakao_social_login(
    request: SocialLoginRequest,
    session: AsyncSession = Depends(get_db)
) -> LoginResponse:
    
    # 액세스 토큰으로 카카오 유저 정보 조회
    headers = {
        "Authorization": f"Bearer {request.access_token}",
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(KAKAO_USER_INFO_URL, headers=headers)
    
    if response.status_code != 200:
        print("카카오 응답 상태:", response.status_code)
        print("카카오 응답 내용:", response.text) 
        raise Exception("카카오 사용자 정보 조회 실패")

    try:
        kakao_info = response.json()
        print("카카오 유저 정보:", kakao_info)
        kakao_id = str(kakao_info["id"])
        nickname = kakao_info["properties"]["nickname"]
        profile_image = kakao_info["properties"].get("profile_image", None)

        # DB에서 사용자 존재 여부 확인 또는 생성
        user: User = await get_or_create_user(session, kakao_id, nickname, profile_image, "kakao")

        # JWT 토큰 발급
        access_token = create_access_token(user["user_id"])
        refresh_token = create_refresh_token(user["user_id"])

        # 응답 반환
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserInfo(**user)
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