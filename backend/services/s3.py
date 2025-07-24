import boto3
import os
from dotenv import load_dotenv
from datetime import datetime
from fastapi import HTTPException
import io
load_dotenv()

s3 = boto3.client('s3',
    region_name=os.getenv("AWS_S3_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

def upload_pdf_to_s3(file, filename, folder_name):
    try:
        aws_s3_region = os.getenv('AWS_S3_REGION')
        bucket_name = os.getenv("AWS_S3_BUCKET_NAME")

        if not aws_s3_region or not bucket_name:
            raise ValueError("S3 환경변수가 설정되지 않았습니다.")

        # 업로드된 pdf 파일 경로 : bot_{company_name}_{detail_id} 폴더 / input / filename 구조로 저장
        s3_key = f"{folder_name}/input/{filename}"

        # input파일 업로드 + output,vectordb 폴더 생성(더미 사용)
        s3.upload_fileobj(file, bucket_name, s3_key, ExtraArgs={"ContentType": "application/pdf"})
        s3.upload_fileobj(
            io.BytesIO(b"This is a placeholder."),
            bucket_name,
            f"{folder_name}/output/placeholder.txt",
            ExtraArgs={"ContentType": "text/plain"}
        )
        s3.upload_fileobj(
            io.BytesIO(b"This is a placeholder."),
            bucket_name,
            f"{folder_name}/vectordb/placeholder.txt",
            ExtraArgs={"ContentType": "text/plain"}
        )

        return f"https://{bucket_name}.s3.{aws_s3_region}.amazonaws.com/{s3_key}"

    except Exception as e:
        # 업로드 실패 시 FastAPI HTTPException으로 명확하게 에러 반환
        raise HTTPException(status_code=500, detail=f"S3 업로드 실패: {str(e)}")