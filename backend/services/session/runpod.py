import requests
import os
from dotenv import load_dotenv

load_dotenv()

RUNPOD_API_KEY = os.getenv("RUNPOD_API_KEY")
RUNPOD_STT_POD_ID = os.getenv("RUNPOD_STT_POD_ID")  # 고정된 Pod ID

def start_runpod_pod():
    url = f"https://rest.runpod.io/v1/pods/{RUNPOD_STT_POD_ID}/start"
    headers = {
        "Authorization": f"Bearer {RUNPOD_API_KEY}",
        "Content-Type":  "application/json"
    }

    resp = requests.post(url, headers=headers)
    resp.raise_for_status()

    if resp.status_code != 200 or "errors" in resp.json():
        raise Exception(f"RunPod 실행 실패: {resp.text}")
    return resp.json()