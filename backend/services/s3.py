import boto3
import os
from dotenv import load_dotenv
from datetime import datetime
from fastapi import HTTPException

load_dotenv()

s3 = boto3.client('s3',
    region_name=os.getenv("AWS_S3_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

def upload_pdf_to_s3(file, filename):
    try:
        aws_s3_region = os.getenv('AWS_S3_REGION')
        bucket_name = os.getenv("AWS_S3_BUCKET_NAME")

        if not aws_s3_region or not bucket_name:
            raise ValueError("S3 환경변수가 설정되지 않았습니다.")

        # 현재 시간 기준으로 폴더 구성
        s3_key = f"{datetime.now().strftime('%Y%m%d%H%M%S')}/{filename}"

        # 업로드
        s3.upload_fileobj(file, bucket_name, s3_key, ExtraArgs={"ContentType": "application/pdf"})

        return f"https://{bucket_name}.s3.{aws_s3_region}.amazonaws.com/{s3_key}"

    except Exception as e:
        # 업로드 실패 시 FastAPI HTTPException으로 명확하게 에러 반환
        raise HTTPException(status_code=500, detail=f"S3 업로드 실패: {str(e)}")