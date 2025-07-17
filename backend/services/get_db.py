import os
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager

DATABASE_URL = os.getenv('GENBOTDB_LOCAL_URL')

# 데이터베이스와 실제로 연결하는 객체인 엔진 생성
engine = create_async_engine(DATABASE_URL, echo=True)

# 세션 생성
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

# 세션 반환
async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        yield session
