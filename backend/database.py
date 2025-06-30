import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

GENBOTDB_LOCAL_URL = os.getenv('GENBOTDB_LOCAL_URL')

engine = create_engine(GENBOTDB_LOCAL_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()