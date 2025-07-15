from fastapi import APIRouter, Depends, HTTPException, status
from schemas.request.auth import (
    SocialLoginRequest, LogoutRequest, UserUpdateRequest, UserDeleteRequest
)
from schemas.response.auth import (
    LoginResponse, LogoutResponse, UserMeResponse, UserDeleteResponse
)
from services.auth import (
    social_login, logout_user, get_current_user, update_user_info, delete_user
)


router = APIRouter(prefix="/auth", tags=["Auth"])

# 로그인
@router.post("/login", response_model=LoginResponse)
async def login(request: SocialLoginRequest):
    return await social_login(request)

# 로그아웃
@router.post("/logout", response_model=LogoutResponse)
async def logout(request: LogoutRequest):
    return await logout_user(request)

# 내 정보 조회
@router.get("/me", response_model=UserMeResponse)
async def get_me(user=Depends(get_current_user)):
    return {"user": user}

# 내 정보 수정
@router.patch("/me", response_model=UserMeResponse)
async def update_me(request: UserUpdateRequest, user=Depends(get_current_user)):
    return await update_user_info(user, request)

# 탈퇴
@router.delete("/me", response_model=UserDeleteResponse)
async def delete_me(request: UserDeleteRequest, user=Depends(get_current_user)):
    return await delete_user(user, request)
