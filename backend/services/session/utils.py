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
import re

load_dotenv()

model_path = os.getenv("MODEL_PATH")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

def prepare_whisper_model():
    return WhisperModel(
        model_path,
        device=DEVICE,
        compute_type="float16" if DEVICE == "cuda" else "int8"
    )

whisper_pipe = prepare_whisper_model()

# 문장 종결 체크 함수 (한국어 포함)
def contains_sentence_end(text):
    return bool(re.search(r"[.?!…。?!]|[.?!…。?!]", text.strip()))

# Local Agreement(n=2)
def local_agreement(current_tokens, prev_tokens, n=2):
    agreed = []
    for i in range(min(len(current_tokens), len(prev_tokens))):
        if current_tokens[i] == prev_tokens[i]:
            agreed.append(current_tokens[i])
        else:
            break
    return agreed if len(agreed) >= n else []

# Whisper Streaming-style transcribe
def whisper_streaming_transcribe(audio_path, language="ko", min_chunk_sec=1):
    # 오디오 로드
    y, sr = sf.read(audio_path)
    if len(y.shape) > 1:
        y = y.mean(axis=1)  # mono 변환

    total_samples = y.shape[0]
    chunk_samples = int(min_chunk_sec * sr)
    pointer = 0

    buffer = []
    prev_tokens = []
    final_sentences = []
    current_text = ""
    
    # chunk별 반복
    while pointer < total_samples:
        # chunk 누적
        end = min(pointer + chunk_samples, total_samples)
        buffer.append(y[pointer:end])
        pointer = end

        # 누적된 buffer 전체로 Whisper inference
        cur_audio = np.concatenate(buffer, axis=0)
        segments, _ = whisper_pipe.transcribe(cur_audio, language=language, beam_size=5)
        text = "".join([seg.text for seg in segments]).strip()
        tokens = text.split()

        # Local Agreement(n=2)
        agreed = local_agreement(tokens, prev_tokens, n=2)
        if agreed:
            new_text = " ".join(agreed)
            if new_text not in current_text:
                current_text += new_text[len(current_text):]
        
        # 문장 종결
        if contains_sentence_end(text):
            sentence = current_text.strip()
            if sentence:
                final_sentences.append(sentence)
            buffer = []
            prev_tokens = []
            current_text = ""
        else:
            prev_tokens = tokens

    # 마지막 남은 텍스트
    if current_text.strip():
        final_sentences.append(current_text.strip())

    return final_sentences


# --- OpenAI TTS 함수 ---
def text_to_speech(content, voice="alloy"):
    response = openai.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=content
    )
    return io.BytesIO(response.content)
