from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Session(Base):
    __tablename__ = "session"
    
    session_id = Column(String(255), primary_key=True)
    bot_id = Column(String(255), ForeignKey("csbot.bot_id", ondelete="CASCADE"), nullable=False)
    
    csbot = relationship("CSbot", back_populates="sessions")
    chatlogs = relationship("ChatLog", back_populates="session", cascade="all, delete-orphan")
    voicelogs = relationship("VoiceLog", back_populates="session", cascade="all, delete-orphan")