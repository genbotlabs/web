from pydantic import BaseModel

class ChatResponse(BaseModel):
    context: str
    turn:int
    role:str