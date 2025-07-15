from models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound

async def get_or_create_user(session: AsyncSession, kakao_id: str, nickname: str, profile_image: str, provider: str) -> User:
    result = await session.execute(select(User).where(User.social_id == kakao_id))
    user = result.scalars().first()

    if user:
        return user
    
    user = User(
        user_id=f"user_{kakao_id}",
        social_id=kakao_id,
        nickname=nickname,
        profile_image=profile_image,
        provider=provider
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user