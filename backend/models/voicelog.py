from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base

class VoiceLog(Base):
    __tablename__ = "voicelog"

    session_id = Column(Integer, primary_key=True, autoincrement=True)
    voice_id = Column(Integer, ForeignKey("voicebot.voicebot_id", ondelete="CASCADE"), nullable=False)
    question = Column(String(255), nullable=False)
    answer = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now())

    voicebot = relationship("Voicebot", back_populates="voicelogs")