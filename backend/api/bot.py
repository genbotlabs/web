from fastapi import APIRouter, HTTPException, Path
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
from services.bot.service import service_create_bot
from fastapi import Form, File, UploadFile
from typing import List
router = APIRouter()

# 봇 생성 (완료)
@router.post("", response_model=BotDetailResponse)
async def create_bot(
    company: str = Form(...),
    usage: str = Form(...),
    greeting: str = Form(""),
    description: str = Form(""),
    user_id: int = Form(...),
    type: str = Form(...),
    files: List[UploadFile] = File(...)
):
    return await service_create_bot(
        company=company,
        usage=usage,
        greeting=greeting,
        description=description,
        user_id=user_id,
        type=type,
        files=files
    )