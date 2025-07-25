from sqlalchemy.orm import Session
from database import SessionLocal
from models.detail import Detail
from schemas.request.bot import BotCreateRequest
from schemas.response.bot import BotDetailItem, BotDataItemResponse
from datetime import datetime
from uuid import uuid4
from fastapi import Form, UploadFile, File, HTTPException
from services.s3 import upload_pdf_to_s3
from services.pdf_parser import parse_pdfs_from_s3
from models.data import Data
from typing import List
import traceback  # 추가
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from schemas.request.bot import BotUpdateRequest  # BotUpdateRequest 클래스
from models.csbot import CSbot

# from models.lang_graph.lang_graph import run_langgraph  # langgraph model_bot

# 봇 생성
async def service_create_bot(
    db: AsyncSession,
    bot_id: str,
    user_id: int,
    company_name: str,
    bot_name: str,
    email: str,
    cs_number: str,
    first_text: str,
    files: List[UploadFile],
):

    '''
        1. user_id로 csbot 생성
        2. detail 생성
        3. csbot의 detail_id를 detail_id로 업데이트
        4. data 생성
    '''

    try:
        csbot = CSbot(
            bot_id=bot_id,
            detail_id=None,
            user_id=user_id,
            bot_url=f'http://localhost:3000/?bot_id={bot_id}',
            status=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(csbot)
        await db.commit()
        await db.refresh(csbot)

        print("✅ csbot 테이블 저장 완료")

        detail = Detail(
            bot_id=bot_id,
            company_name=company_name,
            bot_name=bot_name,
            first_text=first_text,
            email=email,
            cs_number=cs_number
        )
        db.add(detail)
        await db.commit()
        await db.refresh(detail)

        print("✅ detail 테이블 저장 완료")

        csbot.detail_id = detail.detail_id
        await db.commit()
        await db.refresh(csbot)

        print("✅ csbot 테이블 detail_id 업데이트 완료")

        data_items = []
        folder_name = f"bot_{detail.company_name}_{detail.detail_id}"

        for file in files:
            url = upload_pdf_to_s3(file.file, file.filename, folder_name)

            data = Data(
                detail_id=detail.detail_id,
                name=file.filename,
                type=True,
                storage_url=url
            )
            db.add(data)

            data_items.append(
                BotDataItemResponse(
                    data_id=str(uuid4()),
                    filename=file.filename,
                    type=1,
                    storage_url=url
                )
            )

        await db.commit()

        print("✅ data 테이블 저장 완료")
        print('✅ pdf 파싱 시작')

        # s3에서 pdf 파싱
        bucket_name = os.getenv("AWS_S3_BUCKET_NAME")
        parse_message = parse_pdfs_from_s3(bucket_name, folder_name)
        print(">>>",parse_message)

        return {
            "bot": BotDetailItem(
                bot_id="bot_" + str(detail.detail_id),
                company_name=detail.company_name,
                bot_name=detail.bot_name,
                first_text=detail.first_text,
                email=detail.email,
                cs_number=detail.cs_number,
                data=data_items,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        }

    except Exception as e:
        await db.rollback()
        print("[ERROR]", traceback.format_exc())
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")


# 봇 목록 조회
async def bot_list(user_id: int, db: AsyncSession) -> List[BotDetailItem]:
    result = await db.execute(
        select(Detail).where(Detail.user_id == user_id)
    )
    details = result.scalars().all()

    return [
        BotDetailItem(
            bot_id=str(detail.detail_id),
            company_name=detail.company_name,
            bot_name=detail.bot_name,
            first_text=detail.first_text or "",
            email=detail.email,
            cs_number=detail.cs_number,
            data=[
                BotDataItemResponse(
                    data_id=str(d.data_id),
                    filename=d.filename,
                    type=d.type,
                    storage_url=d.storage_url
                ) for d in detail.datas
            ],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        for detail in details
    ]

# 봇 삭제
async def delete_bot(bot_id: str, user_id: int, db: AsyncSession):
    # 1. UUID로 CSbot 조회
    result = await db.execute(
        select(CSbot).where(CSbot.bot_id == bot_id, CSbot.user_id == user_id)
    )
    csbot = result.scalar_one_or_none()
    if not csbot:
        raise HTTPException(status_code=404, detail="봇이 존재하지 않거나 삭제 권한이 없습니다.")

    # 2. 해당 detail_id로 Detail 조회
    result = await db.execute(
        select(Detail).where(Detail.detail_id == csbot.detail_id)
    )
    detail = result.scalar_one_or_none()

    # 3. 연결된 Data 삭제
    for data in detail.datas:
        await db.delete(data)

    # 4. Detail 삭제
    await db.delete(detail)

    # 5. CSbot 삭제
    await db.delete(csbot)

    await db.commit()



# 봇 수정
async def update_bot(
    bot_id: int,
    user_id: int,
    update_data: BotUpdateRequest,
    db: AsyncSession
):
    result = await db.execute(
        select(Detail).where(Detail.detail_id == bot_id, Detail.user_id == user_id)
    )
    detail = result.scalar_one_or_none()

    if not detail:
        raise HTTPException(status_code=404, detail="해당 봇이 존재하지 않거나 권한이 없습니다.")

    # 필드별로 조건부 수정
    if update_data.company_name is not None:
        detail.company_name = update_data.company_name
    if update_data.bot_name is not None:
        detail.bot_name = update_data.bot_name
    if update_data.first_text is not None:
        detail.first_text = update_data.first_text
    if update_data.email is not None:
        detail.email = update_data.email
    if update_data.cs_number is not None:
        detail.cs_number = update_data.cs_number

    await db.commit()
    await db.refresh(detail)

    return {"success": True, "message": "봇 정보가 성공적으로 수정되었습니다."}