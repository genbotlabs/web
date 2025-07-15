from sqlalchemy import Column, String, Text, DateTime, func, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "user"

    user_id = Column(String(255), primary_key=True, index=True, autoincrement=True)
    password = Column(String(255), nullable=True)
    nickname = Column(String(255), nullable=True)
    provider = Column(String(20), nullable=True)
    social_id = Column(String(100), nullable=False)
    profile_image = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    csbot = relationship("CSbot", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('provider', 'social_id', name='uq_provider_social_id'),
    )