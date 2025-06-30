from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), nullable=True, unique=True)
    password = Column(String(255), nullable=True)
    phone_number = Column(String(20), nullable=True)
    company_name = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)
    position = Column(String(255), nullable=True)
    provider = Column(String(20), nullable=True)
    social_id = Column(String(100), nullable=True)
    profile_image = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    chatbots = relationship("Chatbot", back_populates="user", cascade="all, delete-orphan")
    voicebots = relationship("Voicebot", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('provider', 'social_id', name='uq_provider_social_id'),
    )

class Chatbot(Base):
    __tablename__ = "chatbot"

    chatbot_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False)
    chatbot_url = Column(String, nullable=False, default="https://localhost:3000")
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="chatbots")
    chatlogs = relationship("ChatLog", back_populates="chatbot", cascade="all, delete-orphan")

class Voicebot(Base):
    __tablename__ = "voicebot"

    voicebot_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False)
    voicebot_url = Column(String, nullable=False, default="/api/webhook-url")
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="voicebots")
    voicelogs = relationship("VoiceLog", back_populates="voicebot", cascade="all, delete-orphan")

class ChatLog(Base):
    __tablename__ = "chatlog"

    session_id = Column(Integer, primary_key=True, autoincrement=True)
    chatbot_id = Column(Integer, ForeignKey("chatbot.chatbot_id", ondelete="CASCADE"), nullable=False)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now())

    chatbot = relationship("Chatbot", back_populates="chatlogs")

class VoiceLog(Base):
    __tablename__ = "voicelog"

    session_id = Column(Integer, primary_key=True, autoincrement=True)
    voice_id = Column(Integer, ForeignKey("voicebot.voicebot_id", ondelete="CASCADE"), nullable=False)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now())

    voicebot = relationship("Voicebot", back_populates="voicelogs")

class Data(Base):
    __tablename__ = "data"

    data_id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(Boolean, nullable=False)
    storage_url = Column(String, nullable=False)
    detail_id = Column(Integer, ForeignKey("detail.detail_id", ondelete="CASCADE"), nullable=False)

    detail = relationship("Detail", back_populates="data_items")

class Detail(Base):
    __tablename__ = "detail"

    detail_id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String, nullable=True)
    usage = Column(String, nullable=True)
    first_text = Column(String, nullable=True)
    description = Column(String, nullable=True)
    voicebot_id = Column(Integer, ForeignKey("voicebot.voicebot_id", ondelete="RESTRICT"), nullable=True)
    chatbot_id = Column(Integer, ForeignKey("chatbot.chatbot_id", ondelete="RESTRICT"), nullable=True)

    voicebot = relationship("Voicebot", backref="details")
    chatbot = relationship("Chatbot", backref="details")
    data_items = relationship("Data", back_populates="detail", cascade="all, delete-orphan")