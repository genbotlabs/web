from pydantic import BaseModel

class ChatRequest(BaseModel):
    session_id: str
    turn: int
    content: str
    bot_id : str
    