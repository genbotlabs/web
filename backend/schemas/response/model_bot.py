from pydantic import BaseModel

class ChatResponse(BaseModel):
    content: str
    turn: int
    role: str
    session_id: str  
