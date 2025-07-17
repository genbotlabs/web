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

async def google_social_login(code: str, session: AsyncSession) -> LoginResponse:
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=token_data)
        token_json = token_res.json()

    access_token = token_json.get("access_token")
    if not access_token:
        return {"error": "구글 토큰 오류", "detail": token_json}

    user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(user_info_url, headers=headers)

    try:
        google_info = response.json()
        google_id = str(google_info.get("id"))
        nickname = google_info.get("name")
        profile_image = google_info.get("picture")

        user: User = await get_or_create_user(session, google_id, nickname, profile_image, "google")

        access_token = create_access_token(user.user_id)
        refresh_token = create_refresh_token(user.user_id)

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserInfo(**user.__dict__)
        )
    except Exception as e:
        print("로그인 처리 중 에러:", e)
        raise HTTPException(status_code=500, detail=str(e))

async def naver_social_login(code: str, state: str, session: AsyncSession) -> LoginResponse:
    token_url = "https://nid.naver.com/oauth2.0/token"
    params = {
        "grant_type": "authorization_code",
        "client_id": os.getenv('NAVER_CLIENT_ID'),
        "client_secret": os.getenv('NAVER_CLIENT_SECRET'),
        "code": code,
        "state": state,
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, params=params)
        token_json = token_res.json()

    access_token = token_json.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail=f"네이버 토큰 오류: {token_json}")
    
    user_info_url = "https://openapi.naver.com/v1/nid/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(user_info_url, headers=headers)

    try:
        naver_info = response.json()["response"] 
        naver_id = str(naver_info.get("id"))
        nickname = naver_info.get("name")
        profile_image = naver_info.get("profile_image")

        user: User = await get_or_create_user(session, naver_id, nickname, profile_image, "naver")

        access_token = create_access_token(user.user_id)
        refresh_token = create_refresh_token(user.user_id)
        
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserInfo(**user.__dict__)
        )
    except Exception as e:
        print("로그인 처리 중 에러:", e)
        raise HTTPException(status_code=500, detail=str(e))