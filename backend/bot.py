import os
from fastapi import UploadFile, File, Form, APIRouter
from typing import List

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
    files: List[UploadFile] = File(...)
):
    for file in files:
        contents = await file.read()
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(contents)
        
        uploaded_urls = []
        if file.filename.endswith(".json"):
            url = upload_json_to_s3(file.file, file.filename)
            uploaded_urls.append(url)

    return {
        "message": "Bot 생성 요청 수신 완료",
        "uploaded_urls": uploaded_urls,
        "info": {
            "type": type,
            "company": company,
            "usage": usage,
            "greeting": greeting,
            "description": description,
            "file_count": len(files)
        }
    }
