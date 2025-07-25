import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.csbot import CSbot 

async def generate_unique_bot_id(db: AsyncSession) -> uuid.UUID:
    while True:
        new_id = uuid.uuid4()
        result = await db.execute(
            select(CSbot).where(CSbot.bot_id == new_id)
        )
        existing_bot = result.scalar_one_or_none()

        if not existing_bot:
            return new_id