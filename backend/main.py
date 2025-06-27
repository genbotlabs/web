from fastapi import FastAPI, Request
import httpx, os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React 개발 서버 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

KAKAO_CLIENT_ID = os.getenv("KAKAO_REST_API_KEY")
KAKAO_REDIRECT_URI = os.getenv("KAKAO_REDIRECT_URI")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = os.getenv("GITHUB_REDIRECT_URI")


@app.get("/kakao/callback")
async def kakao_callback(code: str):
    token_url = "https://kauth.kakao.com/oauth/token"
    token_data = {
        "grant_type": "authorization_code",
        "client_id": KAKAO_CLIENT_ID,
        "redirect_uri": KAKAO_REDIRECT_URI,
        "code": code,
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
        token_json = token_response.json()

    access_token = token_json.get("access_token")
    if not access_token:
        return {"error": "Failed to get access token", "detail": token_json}

    user_info_url = "https://kapi.kakao.com/v2/user/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        user_response = await client.get(user_info_url, headers=headers)
        user_json = user_response.json()

    return {"message": "로그인 성공", "user": user_json}


@app.get("/google/callback")
async def google_callback(code: str):
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=token_data)
        token_json = token_res.json()

    access_token = token_json.get("access_token")
    if not access_token:
        return {"error": "Token fetch failed", "detail": token_json}

    user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_info_url, headers=headers)
        user_info = user_res.json()

    return {"message": "구글 로그인 성공", "user": user_info}


@app.get("/github/callback")
async def github_callback(code: str):
    token_url = "https://github.com/login/oauth/access_token"
    headers = {"Accept": "application/json"}
    token_data = {
        "code": code,
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "redirect_uri": GITHUB_REDIRECT_URI,
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, headers=headers, data=token_data)
        token_json = token_res.json()

    access_token = token_json.get("access_token")
    if not access_token:
        return {"error": "Failed to get access token", "detail": token_json}

    user_info_url = "https://api.github.com/user"
    headers = {"Authorization": f"token {access_token}"}
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_info_url, headers=headers)
        user_info = user_res.json()

    return {"message": "GitHub 로그인 성공", "user": user_info}