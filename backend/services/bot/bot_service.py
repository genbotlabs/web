from sqlalchemy.orm import Session
from database import SessionLocal
from models.detail import Detail
from schemas.request.bot import BotCreateRequest
from schemas.response.bot import BotDetailItem
from datetime import datetime
from uuid import uuid4

def service_create_bot(request: BotCreateRequest):
    bot_id = int(uuid4().int >> 96)
    now = datetime.utcnow()

    detail = Detail(
        bot_id=bot_id,
        company_name=request.company_name,
        bot_name=request.usage,
        first_text=request.first_text,
        email=request.email,
        cs_number=request.cs_number,
    )

    session: Session = SessionLocal()
    try:
        session.add(detail)
        session.commit()
        session.refresh(detail)
    finally:
        session.close()

    return {
        "bot": BotDetailItem(
            bot_id=detail.bot_id,
            company_name=detail.company_name,
            bot_name=detail.bot_name,
            first_text=detail.first_text,
            email=detail.email,
            cs_number=detail.cs_number,
            data=request.data,
            created_at=now,
            updated_at=now,
        )
    }
