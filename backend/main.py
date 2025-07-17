from fastapi import FastAPI, Request
import httpx, os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from fastapi import Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User 

from fastapi.responses import RedirectResponse
import urllib.parse

from bot import router as bot_router

load_dotenv()

app = FastAPI()

app.include_router(bot_router)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
async def kakao_callback(code: str, db: Session = Depends(get_db)):
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
        user_res = await client.get(user_info_url, headers=headers)
        user_json = user_res.json()

    kakao_id = str(user_json.get("id"))
    kakao_account = user_json.get("kakao_account", {})
    # email = user_json.get("email") or "";
    profile = kakao_account.get("profile", {})
    name = profile.get("nickname", "")
    profile_image = profile.get("profile_image_url", "")

    user = db.query(User).filter_by(provider="kakao", social_id=kakao_id).first()
    if not user:
        user = User(
            # email="",
            password=None,
            # phone_number="",
            # company_name="",
            nickname=name,
            # position="",
            provider="kakao",
            social_id=kakao_id,
            profile_image=profile_image,
        )
        db.add(user)
    else:
        # user.email = email
        user.nickname = name
        user.profile_image = profile_image

    db.commit()

    query = urllib.parse.urlencode({
        "user_id": user.user_id,
        # "email": email,
        "nickname": name,
        "profile_image": profile_image
    })
    return RedirectResponse(f"http://localhost:3000/?{query}")



@app.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
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
        return {"error": "Failed to get access token", "detail": token_json}

    user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_info_url, headers=headers)
        user_json = user_res.json()

    google_id = str(user_json.get("id"))
    email = user_json.get("email")
    name = user_json.get("name")
    profile_image = user_json.get("picture")

    user = db.query(User).filter_by(provider="google", social_id=google_id).first()

    if not user:
        user = User(
            email=email,
            password=None,
            phone_number="", 
            company_name="",
            name=name,
            position="",
            provider="google",
            social_id=google_id,
            profile_image=profile_image,
        )
        db.add(user)
    else:
        user.email = email
        user.name = name
        user.profile_image = profile_image

    db.commit()

    query = urllib.parse.urlencode({
        "user_id": user.user_id,
        "email": email,
        "name": name,
        "profile_image": profile_image
    })
    return RedirectResponse(f"http://localhost:3000/?{query}")


@app.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    token_url = "https://github.com/login/oauth/access_token"
    token_data = {
        "client_id": os.getenv("GITHUB_CLIENT_ID"),
        "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
        "code": code,
        "redirect_uri": os.getenv("GITHUB_REDIRECT_URI"),
    }
    headers = {"Accept": "application/json"}

    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=token_data, headers=headers)
        token_json = token_res.json()

    access_token = token_json.get("access_token")
    if not access_token:
        return {"error": "GitHub 토큰 오류", "detail": token_json}

    user_info_url = "https://api.github.com/user"
    headers = {"Authorization": f"token {access_token}"}
    async with httpx.AsyncClient() as client:
        user_res = await client.get(user_info_url, headers=headers)
        user_json = user_res.json()

    github_id = str(user_json.get("id"))
    email = user_json.get("email") or "";
    name = user_json.get("name") or user_json.get("login") or ""
    profile_image = user_json.get("avatar_url", "")

    user = db.query(User).filter_by(provider="github", social_id=github_id).first()
    if not user:
        user = User(
            email=email,
            password=None,
            phone_number="",
            company_name="",
            name=name,
            position="",
            provider="github",
            social_id=github_id,
            profile_image=profile_image,
        )
        db.add(user)
    else:
        user.email = email
        user.name = name
        user.profile_image = profile_image

    db.commit()

    query = urllib.parse.urlencode({
        "user_id": user.user_id,
        "email": email,
        "name": name,
        "profile_image": profile_image
    })
    return RedirectResponse(f"http://localhost:3000/?{query}")
