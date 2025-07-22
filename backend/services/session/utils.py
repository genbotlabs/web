import os
import boto3
from transformers import pipeline
import openai
import io
import torch

# --- S3 Whisper 모델 동기화 ---
def s3_sync_folder(bucket, s3_prefix, local_dir):
    s3 = boto3.resource('s3')
    bucket = s3.Bucket(bucket)
    for obj in bucket.objects.filter(Prefix=s3_prefix):
        if obj.key.endswith("/"): continue
        rel_path = os.path.relpath(obj.key, s3_prefix)
        local_path = os.path.join(local_dir, rel_path)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        bucket.download_file(obj.key, local_path)

# --- Whisper 싱글턴 파이프라인 준비 ---
S3_BUCKET = "genbot-stt"
S3_PREFIX = "whisper-small-ko/"
LOCAL_MODEL_PATH = "uploads/whisper-small-ko"

def prepare_whisper_model():
    if not (os.path.exists(LOCAL_MODEL_PATH) and len(os.listdir(LOCAL_MODEL_PATH)) > 2):
        s3_sync_folder(S3_BUCKET, S3_PREFIX, LOCAL_MODEL_PATH)
    return pipeline(
        "automatic-speech-recognition",
        model=LOCAL_MODEL_PATH,
        tokenizer=LOCAL_MODEL_PATH,
        feature_extractor=LOCAL_MODEL_PATH,
        device = "cuda" if torch.cuda.is_available() else "cpu"
    )

whisper_pipe = prepare_whisper_model()

# --- OpenAI TTS 함수 ---
def text_to_speech(text, voice="alloy"):
    response = openai.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=text
    )
    return io.BytesIO(response.content)
