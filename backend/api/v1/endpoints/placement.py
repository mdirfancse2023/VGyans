from fastapi import APIRouter
from typing import List, Dict, Any
from backend.services.placement_service import PlacementService

router = APIRouter(prefix="/placement", tags=["Placement Preparation Core"])
placement_service = PlacementService()

@router.get("/roadmap", response_model=List[Dict[str, Any]])
def get_placement_roadmap():
    return placement_service.get_roadmap()

@router.get("/experiences", response_model=List[Dict[str, Any]])
def get_interview_experiences():
    return placement_service.get_experiences()

@router.get("/mock-interviews", response_model=List[Dict[str, Any]])
def get_mock_interviews():
    return placement_service.get_mock_interviews()
