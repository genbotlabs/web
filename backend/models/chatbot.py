from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base

class Chatbot(Base):
    __tablename__ = "chatbot"

    chatbot_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False)
    chatbot_url = Column(String, nullable=False, default="https://localhost:3000")
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="chatbots")
    chatlogs = relationship("ChatLog", back_populates="chatbot", cascade="all, delete-orphan")