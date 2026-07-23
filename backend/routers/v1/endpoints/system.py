from fastapi import APIRouter
from typing import Dict, Any

try:
    from backend.schemas.feedback import FeedbackCreateDTO
    from backend.services.system_service import SystemService
except ModuleNotFoundError:
    from schemas.feedback import FeedbackCreateDTO
    from services.system_service import SystemService

router = APIRouter(tags=["System"])
system_service = SystemService()

@router.get("/stats")
def get_stats() -> Dict[str, Any]:
    return system_service.get_stats()

@router.post("/feedback")
def submit_feedback(fb: FeedbackCreateDTO):
    return {"success": True, "message": "Feedback received successfully", "email": fb.email}
