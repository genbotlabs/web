from fastapi import APIRouter, HTTPException, Path
import uuid
import asyncio
from datetime import datetime

from schemas.request.bot import BotCreateRequest, BotUpdateRequest
from schemas.response.bot import (
    BotDetailResponse,
    BotListResponse,
    BotDeleteResponse,
    UploadedDataListResponse,
    BotDetailItem,
    BotFirstTextResponse
)
from fastapi import Form, File, UploadFile
from typing import List
from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from services.get_db import get_db  
from schemas.response.bot import BotDeleteResponse
from schemas.response.bot import BotContactResponse
from models.detail import Detail
from sqlalchemy import select
from services.bot.service import service_create_bot, initialize_bot_record, bot_list, delete_bot , update_bot, get_bot_id_detail   
# from services.bot.utils import generate_unique_bot_id
from io import BytesIO

router = APIRouter()


# 봇 생성
@router.post("/", response_model=BotDetailResponse)
async def create_bot(
    user_id: int = Form(...),
    company_name: str = Form(...),
    bot_name: str = Form(...),
    email: str = Form(...),
    status: int = Form(...),
    cs_number: str = Form(...),
    first_text: str = Form(...),
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    # bot_id = await generate_unique_bot_id(db)
    # bot_id = str(bot_id)

    csbot = await initialize_bot_record(db=db, user_id=user_id)
    bot_id = csbot.bot_id

    copied_files = []
    for file in files:
        content = await file.read()
        copied_files.append({
            "filename": file.filename,
            "file": BytesIO(content)
        })

    # 백그라운드 실행
    asyncio.create_task(
        service_create_bot(
            db=None,
            bot_id=bot_id,
            user_id=user_id,
            company_name=company_name,
            bot_name=bot_name,
            email=email,
            status=status,
            cs_number=cs_number,
            first_text=first_text,
            files=copied_files
        )
    )

    return BotDetailResponse(
        bot=BotDetailItem(
            user_id=user_id,
            bot_id=bot_id,
            company_name=company_name,
            bot_name=bot_name,
            email=email,
            status=0,
            cs_number=cs_number,
            first_text=first_text,
            files=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    )

@router.get("/detail/{bot_id}")
async def get_bot_detail(
    bot_id: str,
    db: AsyncSession = Depends(get_db)
):
    bot_id = str(bot_id)
    print('>>>>>', bot_id)
    return await get_bot_id_detail(bot_id=bot_id, db=db)

# 봇 목록 조회
@router.get("/{user_id}", response_model=BotListResponse)
async def get_bot_list(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    특정 user_id에 해당하는 봇 목록을 조회합니다.
    """
    bots = await bot_list(user_id=user_id, db=db)
    return BotListResponse(bots=bots)

# 봇 삭제
@router.delete("/{bot_id}", response_model=BotDeleteResponse)
async def delete_user_bot(
    bot_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    user_id가 소유한 봇 중에서 특정 봇 ID를 삭제합니다.
    """
    return await delete_bot(bot_id=bot_id, db=db)

# 봇 수정
@router.patch("/{bot_id}", response_model=BotDeleteResponse)
async def patch_bot_info(
    bot_id: str,
    update_data: BotUpdateRequest = Depends(),
    db: AsyncSession = Depends(get_db)
):
    return await update_bot(bot_id, update_data, db)

# 런팟 넘길 때 필요한 정보들
@router.get("/contact/{bot_id}", response_model=BotContactResponse)
async def get_bot_contact(
    bot_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Detail).where(Detail.bot_id == bot_id)
    )
    detail_obj = result.scalar_one_or_none()
    if detail_obj is None:
        raise HTTPException(status_code=404, detail="Bot not found")
    return BotContactResponse(
        cs_number=detail_obj.cs_number,
        email=detail_obj.email,
        detail_id=detail_obj.detail_id
    )