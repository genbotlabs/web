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

router = APIRouter()

# 봇 생성 (완료)
@router.post("", response_model=BotDetailResponse)
async def create_bot(request: BotCreateRequest):
    return await service_create_bot(request)

