from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Integer
from sqlalchemy.orm import relationship
from database import Base

class CSbot(Base):
    __tablename__ = "csbot"

    detail_id = Column(Integer, ForeignKey("detail.detail_id", ondelete="CASCADE"), nullable=False)
    bot_id = Column(String(255), primary_key=True)
    user_id = Column(Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False)
    bot_url = Column(String(255), nullable=False, default="https://localhost:3000")
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="csbots")
    detail = relationship("Detail", back_populates="csbot")
    sessions = relationship("Session", back_populates="csbot", cascade="all, delete-orphan")