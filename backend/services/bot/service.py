from sqlalchemy.orm import Session
from database import SessionLocal
from models.detail import Detail
from schemas.request.bot import BotCreateRequest
from schemas.response.bot import BotDetailItem
from datetime import datetime
from uuid import uuid4
from fastapi import Form, UploadFile, File, HTTPException
from services.s3 import upload_pdf_to_s3
from models.data import Data
from typing import List
async def service_create_bot(
    company: str = Form(...),
    usage: str = Form(...),
    greeting: str = Form(""),
    description: str = Form(""),
    user_id: int = Form(...),
    files: List[UploadFile] = File(...)
):
    session = SessionLocal()
    try:
        detail = Detail(
            company_name=company,
            usage=usage,
            first_text=greeting,
            description=description,
            bot_id=None
        )
        session.add(detail)
        session.commit()
        session.refresh(detail)

        uploaded_urls = []

        for file in files:
            if file.filename.endswith(".pdf"):
                url = upload_pdf_to_s3(file.file, file.filename)
                uploaded_urls.append(url)

                data = Data(
                    type=True,
                    storage_url=url,
                    detail_id=detail.detail_id
                )
                session.add(data)

        type_list = type.split(",")

        chatbot_id = None
        voicebot_id = None

        session.commit()

        return {
            "message": "Bot 생성 요청 수신 완료",
            "uploaded_urls": uploaded_urls,
            "detail_id": detail.detail_id,
            "chatbot_id": chatbot_id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()