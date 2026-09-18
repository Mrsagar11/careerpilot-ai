from pydantic import BaseModel
from typing import List, Any, Optional

class ChatRequest(BaseModel):
    message: str

class ChatResponseOut(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = []
