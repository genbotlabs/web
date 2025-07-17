import os
from fastapi import UploadFile, File, Form, APIRouter, HTTPException
from typing import List

from models.detail import Detail
from models.data import Data
# from models.chatbot import Chatbot
# from models.voicebot import Voicebot
from database import SessionLocal

from services.s3 import upload_json_to_s3

router = APIRouter()
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/api/generate-bot")
async def generate_bot(
    type: str = Form(...),
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
            voicebot_id=None,
            chatbot_id=None
        )
        session.add(detail)
        session.commit()
        session.refresh(detail)

        uploaded_urls = []

        for file in files:
            if file.filename.endswith(".json"):
                url = upload_json_to_s3(file.file, file.filename)
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

        # if "챗봇" in type_list:
        #     chatbot = Chatbot(user_id=user_id)
        #     session.add(chatbot)
        #     session.commit()
        #     session.refresh(chatbot)
        #     chatbot_id = chatbot.chatbot_id
        #     detail.chatbot_id = chatbot_id

        # if "보이스봇" in type_list:
        #     voicebot = Voicebot(user_id=user_id)
        #     session.add(voicebot)
        #     session.commit()
        #     session.refresh(voicebot)
        #     voicebot_id = voicebot.voicebot_id
        #     detail.voicebot_id = voicebot_id

        session.commit()

        return {
            "message": "Bot 생성 요청 수신 완료",
            "uploaded_urls": uploaded_urls,
            "detail_id": detail.detail_id,
            "chatbot_id": chatbot_id,
            "voicebot_id": voicebot_id
        }

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()
