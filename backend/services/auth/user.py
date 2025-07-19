from models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

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