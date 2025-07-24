from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Text
from sqlalchemy.orm import relationship
from database import Base

class VoiceLog(Base):
    __tablename__ = "voicelog"
    
    voice_id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(255), ForeignKey("session.session_id", ondelete="CASCADE"), nullable=False)
    turn = Column(Integer, nullable=False)
    role = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now())

    session = relationship("Session", back_populates="voicelogs")