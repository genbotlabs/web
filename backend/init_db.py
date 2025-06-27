from database import engine
from models import Base

Base.metadata.create_all(bind=engine)
print("✅ 테이블 생성 완료")
