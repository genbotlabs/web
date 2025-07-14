from pydantic import BaseModel, Field
from datetime import datetime

class CreateSessionResponse(BaseModel):
    session_id: str = Field(..., example="session_abc123")
    created_at: datetime = Field(..., example="2025-07-14T13:00:00Z")