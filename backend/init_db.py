import asyncio
from models import Base
from database import engine

async def async_create_all():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

asyncio.run(async_create_all())
print("✅ DB 초기화 완료")