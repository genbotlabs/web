from models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import os

from services.get_db import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/user/me")

async def get_or_create_user(session: AsyncSession, id, nickname, profile_image, provider):
    user = await session.execute(
        select(User).where(User.social_id == id, User.provider == provider)
    )
    user = user.scalar_one_or_none()
    if user:
        user.nickname = nickname
        user.profile_image = profile_image
        user.updated_at = datetime.utcnow()
    else:
        user = User(
            provider=provider,
            social_id=id,
            nickname=nickname,
            profile_image=profile_image,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, os.getenv('SECRET_KEY'), os.getenv('ALGORITHM'))
        user_id = int(payload.get("sub"))
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user