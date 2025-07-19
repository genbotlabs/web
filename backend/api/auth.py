from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import urllib.parse
from fastapi.responses import RedirectResponse
from fastapi import Response

from models import User
from schemas.request.auth import (
    SocialLoginRequest, LogoutRequest, UserUpdateRequest, UserDeleteRequest
)
from schemas.response.auth import (
    LoginResponse, LogoutResponse, UserMeResponse, UserDeleteResponse
)
from services.auth.service import (
    kakao_social_login, google_social_login, naver_social_login
)
from services.auth.user import get_current_user
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

@router.delete("/delete", response_model=UserDeleteResponse)
async def delete_account(user_id: int, session: AsyncSession = Depends(get_db)):
    result = await session.execute(
        select(User).where(User.user_id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await session.delete(user)
    await session.commit()
    return UserDeleteResponse(success=True, message="회원 탈퇴가 완료되었습니다.")

@router.get("/user/me", response_model=UserMeResponse)
async def get_my_info(current_user = Depends(get_current_user)):
    return UserMeResponse(
        user_id=current_user.user_id,
        social_id=current_user.social_id,
        nickname=current_user.nickname,
        profile_image=current_user.profile_image,
        provider=current_user.provider,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.put("/user/me", status_code=200)
async def update_my_info(
    update_req: UserUpdateRequest,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    changed = False
    if update_req.nickname is not None:
        current_user.nickname = update_req.nickname
        changed = True
    if update_req.profile_image is not None:
        current_user.profile_image = update_req.profile_image
        changed = True

    if not changed:
        raise HTTPException(status_code=400, detail="수정할 값이 없습니다.")

    from datetime import datetime
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return {"success": True, "message": "회원 정보가 수정되었습니다."}