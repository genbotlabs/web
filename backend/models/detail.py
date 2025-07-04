from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Detail(Base):
    __tablename__ = "detail"

    detail_id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String(255), nullable=True)
    usage = Column(String(255), nullable=True)
    first_text = Column(String(255), nullable=True)
    description = Column(String(255), nullable=True)
    number = Column(String(13), nullable=True)
    voicebot_id = Column(Integer, ForeignKey("voicebot.voicebot_id", ondelete="RESTRICT"), nullable=True)
    chatbot_id = Column(Integer, ForeignKey("chatbot.chatbot_id", ondelete="RESTRICT"), nullable=True)

    voicebot = relationship("Voicebot", backref="details")
    chatbot = relationship("Chatbot", backref="details")
    data_items = relationship("Data", back_populates="detail", cascade="all, delete-orphan")