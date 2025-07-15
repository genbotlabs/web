from schemas.request.auth import (
    SocialLoginRequest, LogoutRequest, UserUpdateRequest, UserDeleteRequest
)
from schemas.response.auth import (
    LoginResponse, LogoutResponse, UserMeResponse, UserDeleteResponse
)


async def kakao_social_login(request: SocialLoginRequest) -> LoginResponse:
    return LoginResponse(
        access_token=,
        refresh_token=,
        user=
    )

async def google_social_login(request: SocialLoginRequest) -> LoginResponse:
    return LoginResponse(
        access_token=,
        refresh_token=,
        user=
    )

async def naver_social_login(request: SocialLoginRequest) -> LoginResponse:
    return LoginResponse(
        access_token=,
        refresh_token=,
        user=
    )