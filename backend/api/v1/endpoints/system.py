from fastapi import APIRouter
from typing import Dict, Any
from backend.schemas.feedback import FeedbackCreateDTO

router = APIRouter(tags=["System"])

@router.get("/stats")
def get_stats() -> Dict[str, Any]:
    return {
        "status": "online",
        "framework": "FastAPI (SOLID Modular Architecture)",
        "version": "4.0.0",
        "totalResources": 250,
        "totalQuestions": 180,
        "totalNotes": 95,
        "totalJobs": 45
    }

@router.post("/feedback")
def submit_feedback(fb: FeedbackCreateDTO):
    return {"success": True, "message": "Feedback received successfully", "email": fb.email}
