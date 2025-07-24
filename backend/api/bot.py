from fastapi import APIRouter, HTTPException, Path
import uuid

from schemas.request.bot import BotCreateRequest, BotUpdateRequest
from schemas.response.bot import (
    BotDetailResponse,
    BotListResponse,
    BotDeleteResponse,
    UploadedDataListResponse,
    BotDetailItem
)
from datetime import datetime
from uuid import uuid4
from fastapi import Form, File, UploadFile
from typing import List
from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from services.get_db import get_db  
from schemas.response.bot import BotDeleteResponse
from services.bot.service import service_create_bot,bot_list,delete_bot , update_bot
from services.bot.utils import generate_unique_id

router = APIRouter()


# 봇 생성
@router.post("", response_model=BotDetailResponse)
async def create_bot(
    db: AsyncSession = Depends(get_db),
    user_id: int = Query(..., description="사용자 ID"),
    company: str = Form(...),
    bot_name: str = Form(...),
    email: str = Form(...),
    consultant_number: str = Form(...),
    greeting: str = Form(...),
    files: List[UploadFile] = File(...),
):
    global uuid
    while True:
        uuid = generate_unique_id()
        if not (uuid):
            break
    
    return await service_create_bot(
        user_id=user_id,
        bot_id=uuid,
        company=company,
        bot_name=bot_name,
        email=email,
        consultant_number=consultant_number,
        greeting=greeting,
        files=files
    )

# 봇 목록 조회
@router.get("/bots/{bot_id}", response_model=BotListResponse)
async def get_bot_list(
    user_id: int = Query(..., description="조회할 사용자의 ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    특정 user_id에 해당하는 봇 목록을 조회합니다.
    """
    bots = await bot_list(user_id=user_id, db=db)
    return BotListResponse(bots=bots)

# 봇 삭제
@router.delete("/bots/{bot_id}", response_model=BotDeleteResponse)
async def delete_user_bot(
    bot_id: int = Path(..., description="삭제할 봇 ID"),
    user_id: int = Query(..., description="사용자 ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    user_id가 소유한 봇 중에서 특정 봇 ID를 삭제합니다.
    """
    await delete_bot(bot_id=bot_id, user_id=user_id, db=db)
    return {"message": f"봇 {bot_id} 삭제 완료"}

# 봇 수정
@router.patch("/bots/{bot_id}", response_model=BotDeleteResponse)
async def patch_bot_info(
    bot_id: int = Path(..., description="수정할 봇 ID"),
    user_id: int = Query(..., description="수정 요청한 사용자 ID"),
    update_data: BotUpdateRequest = Depends(),
    db: AsyncSession = Depends(get_db)
):
    return await update_bot(bot_id, user_id, update_data, db)