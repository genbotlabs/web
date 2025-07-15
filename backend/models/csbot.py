from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Integer
from sqlalchemy.orm import relationship
from database import Base

class CSbot(Base):
    __tablename__ = "csbot"

    bot_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(255), ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False)
    bot_url = Column(String(255), nullable=False, default="https://localhost:3000")
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="csbots")
    detail = relationship("Detail", back_populates="csbot", cascade="all, delete-orphan")
    chatlogs = relationship("ChatLog", back_populates="bot", cascade="all, delete-orphan")