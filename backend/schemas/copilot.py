from pydantic import BaseModel
from typing import List, Optional

class CopilotChatRequestDTO(BaseModel):
    message: str
    topic: Optional[str] = "placement"
    conversation_id: Optional[str] = None

class CopilotChatResponseDTO(BaseModel):
    reply: str
    suggested_actions: List[str]
    topic: str
    status: str = "success"
