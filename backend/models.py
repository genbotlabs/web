from sqlalchemy import Column, Integer, String, Text, DateTime, func, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), nullable=True, unique=True)
    password = Column(String(255), nullable=True)
    phone_number = Column(String(20), nullable=True)
    company_name = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)
    position = Column(String(255), nullable=True)
    provider = Column(String(20), nullable=True)
    social_id = Column(String(100), nullable=True)
    profile_image = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('provider', 'social_id', name='uq_provider_social_id'),
    )