from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional

try:
    from backend.services.placement_service import PlacementService
except ModuleNotFoundError:
    from services.placement_service import PlacementService

router = APIRouter(tags=["Placement Core"])
placement_service = PlacementService()

@router.get("/placement/categories", response_model=List[Dict[str, Any]])
def get_placement_categories():
    return placement_service.get_categories()

@router.get("/placement/category", response_model=Dict[str, Any])
def get_placement_by_category(category: Optional[str] = Query("dsa", description="Placement category: dsa, cs-fundamentals, jobs, interviews")):
    return placement_service.get_placement_by_category(category)

@router.get("/placement-roadmap", response_model=List[Dict[str, Any]])
@router.get("/placement/roadmap", response_model=List[Dict[str, Any]])
def get_placement_roadmap():
    return placement_service.get_roadmap()

@router.get("/placement-experiences", response_model=List[Dict[str, Any]])
@router.get("/placement/experiences", response_model=List[Dict[str, Any]])
def get_interview_experiences():
    return placement_service.get_experiences()

@router.get("/placement-mock-interviews", response_model=List[Dict[str, Any]])
@router.get("/placement/mock-interviews", response_model=List[Dict[str, Any]])
def get_mock_interviews():
    return placement_service.get_mock_interviews()
