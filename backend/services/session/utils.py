import openai
import io
from dotenv import load_dotenv

# load_dotenv()

session_turns = {}

def get_next_turn(session_id, sender):
    if sender == "user":
        session_turns[session_id] = session_turns.get(session_id, 0) + 1
    return session_turns.get(session_id, 1)

# ---- TTS 예시 (OpenAI) ----
def text_to_speech(content, voice="alloy"):
    response = openai.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=content
    )
    return io.BytesIO(response.content)
