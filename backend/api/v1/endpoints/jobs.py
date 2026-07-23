from fastapi import APIRouter, Query
from typing import List, Optional
from backend.schemas.job import JobDTO
from backend.services.job_service import JobService

router = APIRouter(prefix="/jobs", tags=["Jobs"])
job_service = JobService()

@router.get("", response_model=List[JobDTO])
def get_jobs(
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None)
):
    return job_service.get_jobs(category=category, location=location)
