from pydantic import BaseModel
from typing import Optional

class FeedbackCreateDTO(BaseModel):
    name: Optional[str] = "Anonymous"
    email: str
    rating: Optional[int] = 5
    message: str
    page: Optional[str] = ""
