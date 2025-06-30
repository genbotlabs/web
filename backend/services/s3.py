import boto3
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

s3 = boto3.client('s3',
    region_name=os.getenv("AWS_S3_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

def upload_json_to_s3(file, filename):
    aws_s3_region = os.getenv('AWS_S3_REGION')
    bucket_name = os.getenv("AWS_S3_BUCKET_NAME")
    s3_key = f"{datetime.now().strftime('%Y%m%d%H%M%S')}/{filename}"

    s3.upload_fileobj(file, bucket_name, s3_key, ExtraArgs={"ContentType": "application/json"})
    return f"https://{bucket_name}.s3.{aws_s3_region}.amazonaws.com/{s3_key}"
