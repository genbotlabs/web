import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

GENBOTDB_LOCAL_URL = os.getenv('GENBOTDB_LOCAL_URL')

engine = create_async_engine(GENBOTDB_LOCAL_URL)
# 비동기 세션 설정
SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,        # 중요
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)
Base = declarative_base()