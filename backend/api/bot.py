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
from services.bot.bot_service import service_create_bot

router = APIRouter(prefix="/bots", tags=["Bots"])

# 임시 인메모리 DB
_FAKE_BOT_DB = {}

# 🔹 봇 리스트 조회
@router.get("", response_model=BotListResponse)
def get_bot_list():
    return {"bots": list(_FAKE_BOT_DB.values())}


# 봇 생성 (완료)
@router.post("", response_model=BotDetailResponse)
async def create_bot(request: BotCreateRequest):
    return await service_create_bot(request)


# 🔹 봇 상세 조회
@router.get("/{bot_id}", response_model=BotDetailResponse)
def get_bot_detail(bot_id: str = Path(..., example="bot_001")):
    if bot_id not in _FAKE_BOT_DB:
        raise HTTPException(status_code=404, detail="봇을 찾을 수 없습니다.")
    return {"bot": _FAKE_BOT_DB[bot_id]}


# 🔹 봇 정보 수정
@router.patch("/{bot_id}", response_model=BotDetailResponse)
def update_bot(bot_id: str, request: BotUpdateRequest):
    if bot_id not in _FAKE_BOT_DB:
        raise HTTPException(status_code=404, detail="봇을 찾을 수 없습니다.")

    update_fields = request.dict(exclude_unset=True)
    bot = _FAKE_BOT_DB[bot_id]

    for field, value in update_fields.items():
        if field == "usage":
            bot["bot_name"] = value
        else:
            bot[field] = value
    bot["updated_at"] = datetime.utcnow()

    return {"bot": bot}


# 🔹 봇 삭제
@router.delete("/{bot_id}", response_model=BotDeleteResponse)
def delete_bot(bot_id: str):
    if bot_id not in _FAKE_BOT_DB:
        raise HTTPException(status_code=404, detail="봇을 찾을 수 없습니다.")
    del _FAKE_BOT_DB[bot_id]
    return {"success": True, "message": "상담봇이 성공적으로 삭제되었습니다."}


# 🔹 업로드된 데이터 조회
@router.get("/{bot_id}/data", response_model=UploadedDataListResponse)
def get_uploaded_data(bot_id: str):
    if bot_id not in _FAKE_BOT_DB:
        raise HTTPException(status_code=404, detail="봇을 찾을 수 없습니다.")

    return {"files": _FAKE_BOT_DB[bot_id]["data"]}
