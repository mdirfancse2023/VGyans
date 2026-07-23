from pydantic import BaseModel
from typing import List, Optional

class QuestionDTO(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    tags: List[str]
    description: str
    solution: str

class FlashcardDTO(BaseModel):
    id: str
    question: str
    answer: str
    category: str
    difficulty: str
