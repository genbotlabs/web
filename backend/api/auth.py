from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

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


router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login/kakao", response_model=LoginResponse)
async def login(
    request: SocialLoginRequest,
    session: AsyncSession = Depends(get_db)
):
    return await kakao_social_login(request, session)
