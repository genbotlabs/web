import os
import numpy as np
import soundfile as sf
import torch
from concurrent.futures import ProcessPoolExecutor
import asyncio
from faster_whisper import WhisperModel
import webrtcvad
import openai
import io
from dotenv import load_dotenv
import httpx

load_dotenv()

# 환경 변수 및 모델 설정
# MODEL_PATH = os.getenv("MODEL_PATH", "/tmp/whisper-small")
# runpod_url = os.getenv("RUNPOD_URL")
# DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

session_turns = {}

# # Whisper 모델은 프로세스별로 로딩 필요 (멀티프로세스 환경)
# def prepare_whisper_model():
#     return WhisperModel(
#         MODEL_PATH,
#         device=DEVICE,
#         compute_type="float16" if DEVICE == "cuda" else "int8"
#     )

def get_next_turn(session_id, sender):
    if sender == "user":
        session_turns[session_id] = session_turns.get(session_id, 0) + 1
    return session_turns.get(session_id, 1)

# # RunPod 호출 함수
# async def stt_by_runpod(audio_path: str):
#     with open(audio_path, "rb") as f:
#         audio_bytes = f.read()

#     async with httpx.AsyncClient() as client:
#         response = await client.post(
#             runpod_url,
#             files={"audio": ("audio.webm", audio_bytes, "audio/webm")},
#             timeout=60
#         )
#         response.raise_for_status()
#         return response.json().get("text", "")
    
# # ---- VAD로 chunk 생성 ----
# def vad_split(audio, sample_rate=16000, aggressiveness=3, chunk_ms=30):
#     vad = webrtcvad.Vad(aggressiveness)
#     frame_len = int(sample_rate * chunk_ms / 1000)
#     num_frames = int(len(audio) / frame_len)
#     voiced_chunks = []
#     cur_chunk = []
#     for i in range(num_frames):
#         start = i * frame_len
#         end = start + frame_len
#         frame = audio[start:end]
#         if len(frame) < frame_len:
#             break
#         is_voiced = vad.is_speech(frame.tobytes(), sample_rate)
#         if is_voiced:
#             cur_chunk.extend(frame)
#         elif cur_chunk:
#             # 음성 구간 끝, chunk 분리
#             voiced_chunks.append(np.array(cur_chunk, dtype=np.float32))
#             cur_chunk = []
#     if cur_chunk:
#         voiced_chunks.append(np.array(cur_chunk, dtype=np.float32))
#     return voiced_chunks

# # ---- 멀티프로세스 Whisper STT ----
# def stt_chunk(chunk, sample_rate=16000):
#     # 프로세스별 Whisper 모델 로딩 (필수!)
#     model = prepare_whisper_model()
#     segments, _ = model.transcribe(
#         chunk,
#         language="ko",
#         beam_size=1
#     )
#     return "".join([seg.text for seg in segments]).strip()

# # ---- 전체 STT 비동기 파이프라인 ----
# async def whisper_vad_stt_async(audio_path, sample_rate=16000):
#     y, sr = sf.read(audio_path)
#     if len(y.shape) > 1:
#         y = y.mean(axis=1).astype(np.float32)
#     if sr != sample_rate:
#         import librosa
#         y = librosa.resample(y, orig_sr=sr, target_sr=sample_rate)
#         sr = sample_rate

#     chunks = vad_split(y, sample_rate=sr)
#     print(f"[VAD] 추출된 음성 chunk 개수: {len(chunks)}")

#     loop = asyncio.get_event_loop()
#     results = []

#     with ProcessPoolExecutor(max_workers=4) as executor:  # 서버 코어수에 맞게 조정
#         tasks = [
#             loop.run_in_executor(executor, stt_chunk, chunk, sr)
#             for chunk in chunks
#         ]
#         stt_texts = await asyncio.gather(*tasks)
#         results.extend(stt_texts)

#     return " ".join(filter(None, results))

# ---- TTS 예시 (OpenAI) ----


def text_to_speech(content, voice="alloy"):
    response = openai.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=content
    )
    return io.BytesIO(response.content)
