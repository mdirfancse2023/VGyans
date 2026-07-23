from fastapi import APIRouter, HTTPException
from typing import List, Optional
from backend.schemas.question import QuestionDTO, FlashcardDTO
from backend.services.question_service import QuestionService

router = APIRouter(tags=["Placement Questions & Flashcards"])
question_service = QuestionService()

@router.get("/questions", response_model=List[QuestionDTO])
def get_questions(category: Optional[str] = None):
    return question_service.get_questions(category=category)

@router.get("/questions/{question_id}", response_model=QuestionDTO)
def get_question_by_id(question_id: str):
    q = question_service.get_question_by_id(question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q

@router.get("/flashcards", response_model=List[FlashcardDTO])
def get_flashcards():
    return question_service.get_flashcards()
