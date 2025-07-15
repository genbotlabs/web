from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Integer
from sqlalchemy.orm import relationship
from database import Base

class Session(Base):
    __tablename__ = "session"
    
    session_id = Column(String(255), primary_key=True)
    bot_id = Column(Integer, ForeignKey("csbot.bot_id", ondelete="CASCADE"), nullable=False)
    
    csbot = relationship("CSbot", back_populates="sessions")