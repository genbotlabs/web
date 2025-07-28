from fastapi import APIRouter, Depends
import boto3
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

@router.get("/")
def generate_presigned_url(s3_key: str):
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_S3_REGION = os.getenv("AWS_S3_REGION")
    AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")
    
    s3_client = boto3.client(
        "s3",
        region_name=AWS_S3_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
    
    url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": AWS_S3_BUCKET_NAME, "Key": s3_key},
        ExpiresIn=300
    )
    print(">>> url",url)
    return {"url": url}
