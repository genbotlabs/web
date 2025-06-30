import os
from fastapi import UploadFile, File, Form, APIRouter
from typing import List

router = APIRouter()
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/api/generate-bot")
async def generate_bot(
    type: str = Form(...),
    company: str = Form(...),
    purpose: str = Form(...),
    greeting: str = Form(""),
    description: str = Form(""),
    files: List[UploadFile] = File(...)
):
    for file in files:
        contents = await file.read()
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(contents)

    return {
        "message": "Bot 생성 요청 수신 완료",
        "info": {
            "type": type,
            "company": company,
            "purpose": purpose,
            "greeting": greeting,
            "description": description,
            "file_count": len(files)
        }
    }
