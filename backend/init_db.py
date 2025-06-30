from models import Base
from database import engine

Base.metadata.create_all(bind=engine)
print("✅ DB 초기화 완료")
