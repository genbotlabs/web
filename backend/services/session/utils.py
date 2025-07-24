import os
import boto3
import openai
import io
import torch
# from transformers import pipeline
from faster_whisper import WhisperModel
import librosa
import soundfile as sf
import numpy as np
from dotenv import load_dotenv

load_dotenv()

s3_bucket = os.getenv("S3_BUCKET")
s3_prefix = os.getenv("S3_PREFIX")
local_model_path = os.getenv("LOCAL_MODEL_PATH")

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

# --- VAD 처리 함수 ---
# librosa로 VAD 처리: 에너지 기반으로 음성 구간만 추출
def vad_librosa(input_path, output_path, frame_length=2048, hop_length=512, energy_threshold=0.02, margin_sec=0.4):
    """
    librosa로 VAD 처리: 에너지 기반으로 음성 구간만 추출해서 저장
    input_path: 입력 wav 경로
    output_path: 음성만 추출한 새 wav 경로
    """
    # 1. 오디오 불러오기 (16kHz 권장)
    y, sr = librosa.load(input_path, sr=16000)
    
    # 2. 프레임별 root mean square 에너지 계산
    energy = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
    
    # 3. Threshold 이상 프레임 index 구함
    frames = np.where(energy > energy_threshold)[0]
    if frames.size == 0:
        # 음성 없음: 전체 무음
        sf.write(output_path, np.zeros(int(sr * 1.0)), sr)
        return False

    # 4. 구간 시작/끝 시간 찾기
    start_frame = frames[0]
    end_frame = frames[-1]
    start_sample = max(0, start_frame * hop_length - int(margin_sec * sr))
    end_sample = min(len(y), (end_frame + 1) * hop_length + int(margin_sec * sr))

    # 5. 음성 구간만 잘라 저장
    y_vad = y[start_sample:end_sample]
    sf.write(output_path, y_vad, sr)
    return True

def prepare_whisper_model():
    if not (os.path.exists(local_model_path) and len(os.listdir(local_model_path)) > 2):
        s3_sync_folder(s3_bucket, s3_prefix, local_model_path)
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # # no faster_whisper
    # pipe = pipeline(
    #     "automatic-speech-recognition",
    #     model=local_model_path,
    #     tokenizer=local_model_path,
    #     feature_extractor=local_model_path,
    #     device=0 if device == "cuda" else -1,
    # )
    # return pipe
    # faster_whisper

    return WhisperModel(
        local_model_path,
        device=device,
    )

whisper_pipe = prepare_whisper_model()

# --- OpenAI TTS 함수 ---
def text_to_speech(content, voice="alloy"):
    response = openai.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=content
    )
    return io.BytesIO(response.content)
