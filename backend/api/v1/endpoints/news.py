from fastapi import APIRouter
from typing import List, Optional
import requests
from backend.core.config import settings

router = APIRouter(prefix="/news", tags=["News"])

@router.get("", response_model=List[dict])
def get_news(category: Optional[str] = "technology"):
    key = settings.GNEWS_API_KEY
    if key:
        try:
            url = f"https://gnews.io/api/v4/top-headlines?category={category}&lang=en&apikey={key}"
            r = requests.get(url, timeout=5)
            if r.status_code == 200:
                articles = r.json().get("articles", [])
                return [
                    {
                        "id": f"gnews-{i}",
                        "title": a.get("title", ""),
                        "description": a.get("description", ""),
                        "url": a.get("url", ""),
                        "image": a.get("image") or "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500",
                        "publishedAt": a.get("publishedAt", ""),
                        "source": a.get("source", {}).get("name", "GNews")
                    }
                    for i, a in enumerate(articles)
                ]
        except Exception as e:
            print(f"GNews error: {e}")

    return [
        {
            "id": "news-1",
            "title": "Tech Campus Placement Hiring Trends 2026: Demand Surges for Spring Boot & AI",
            "description": "Top IT enterprises prioritize candidates skilled in SOLID design principles, Java 21 microservices, and React 19.",
            "url": "https://virtualgyans.me",
            "image": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500",
            "publishedAt": "2026-07-23T12:00:00Z",
            "source": "VGyans Placement Insights"
        }
    ]
