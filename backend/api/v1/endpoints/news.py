from fastapi import APIRouter
from typing import List, Optional
from backend.services.news_service import NewsService

router = APIRouter(prefix="/news", tags=["News"])
news_service = NewsService()

@router.get("", response_model=List[dict])
def get_news(category: Optional[str] = "technology"):
    return news_service.get_news(category=category)
