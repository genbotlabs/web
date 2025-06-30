from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base

class ChatLog(Base):
    __tablename__ = "chatlog"

    session_id = Column(Integer, primary_key=True, autoincrement=True)
    chatbot_id = Column(Integer, ForeignKey("chatbot.chatbot_id", ondelete="CASCADE"), nullable=False)
    question = Column(String(255), nullable=False)
    answer = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now())

    chatbot = relationship("Chatbot", back_populates="chatlogs")