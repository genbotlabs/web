from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Detail(Base):
    __tablename__ = "detail"

    detail_id = Column(Integer, primary_key=True, autoincrement=True)
    bot_id = Column(String(255), ForeignKey("csbot.bot_id", ondelete="CASCADE"), nullable=False)
    company_name = Column(String(255), nullable=False)
    bot_name = Column(String(255), nullable=False)
    first_text = Column(String(255), nullable=True)
    email = Column(String(255), nullable=False)
    cs_number = Column(String(255), nullable=False)

    csbot = relationship("CSbot", back_populates="detail", cascade="all, delete-orphan")
    datas = relationship("Data", back_populates="detail", cascade="all, delete-orphan")