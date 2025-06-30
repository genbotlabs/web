from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base

class Data(Base):
    __tablename__ = "data"

    data_id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(Boolean, nullable=False)
    storage_url = Column(String, nullable=False)
    detail_id = Column(Integer, ForeignKey("detail.detail_id", ondelete="CASCADE"), nullable=False)

    detail = relationship("Detail", back_populates="data_items")