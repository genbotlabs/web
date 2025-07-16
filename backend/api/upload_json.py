from fastapi import UploadFile, File, APIRouter
from services.s3 import upload_json_to_s3

router = APIRouter()

@router.post("/upload-json")
async def upload_json(file: UploadFile = File(...)):
    if not file.filename.endswith(".json"):
        return {"error": "JSON 파일만 업로드 가능합니다."}

    url = upload_json_to_s3(file.file, file.filename)
    return {"url": url}

# uvicorn main:app --reload 