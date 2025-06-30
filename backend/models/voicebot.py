from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base

class Voicebot(Base):
    __tablename__ = "voicebot"

    voicebot_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False)
    voicebot_url = Column(String(255), nullable=False, default="/api/webhook-url")
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="voicebots")
    voicelogs = relationship("VoiceLog", back_populates="voicebot", cascade="all, delete-orphan")