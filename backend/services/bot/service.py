from sqlalchemy.orm import Session
from database import SessionLocal
from models.detail import Detail
from schemas.request.bot import BotCreateRequest
from schemas.response.bot import BotDetailItem, BotDataItemResponse
from datetime import datetime
from uuid import uuid4
from fastapi import Form, UploadFile, File, HTTPException
from services.s3 import upload_pdf_to_s3
from models.data import Data
from typing import List
import traceback  # 추가

async def service_create_bot(
    company: str = Form(...),
    usage: str = Form(...),
    greeting: str = Form(""),
    description: str = Form(""),
    user_id: int = Form(...),
    type: str = Form(...),  # 이 부분 빠져있었으면 추가
    files: List[UploadFile] = File(...)
):
    session = SessionLocal()
    try:
        detail = Detail(
            user_id=user_id,
            company_name=company,
            bot_name="장수",
            first_text=greeting,
            email="asd@naver.com",
            cs_number="1522-0000"
        )
        session.add(detail)
        await session.commit()
        await session.refresh(detail)

        uploaded_urls = []
        data_items = []
        folder_name = f"bot_{detail.company_name}_{detail.detail_id}"
        
        for file in files:
            if file.filename.endswith(".pdf"):
                url = upload_pdf_to_s3(file.file, file.filename, folder_name)
                uploaded_urls.append(url)

                data = Data(
                    name=file.filename,
                    type=True,
                    storage_url=url,
                    detail_id=detail.detail_id
                )
                session.add(data)

                data_items.append(BotDataItemResponse(
                    data_id=str(uuid4()),
                    filename=file.filename,
                    type=1,  # PDF
                    storage_url=url
                ))

        await session.commit()

        # BotDetailItem 반환
        bot_response = BotDetailItem(
            bot_id="bot_" + str(detail.detail_id),
            company_name=detail.company_name,
            bot_name=detail.bot_name,
            first_text=detail.first_text,
            email="user@example.com",  # 테스트용. 실제로는 detail.email 같은 값에서 가져와야 함
            cs_number="1522-0000",     # 테스트용. 실제로는 detail.cs_number 에서 가져와야 함
            data=data_items,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        return {"bot": bot_response}

    except Exception as e:
        await session.rollback()
        print("[ERROR]", traceback.format_exc())  # ✅ 콘솔에서 확인 가능
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")
    finally:
        await session.close()

