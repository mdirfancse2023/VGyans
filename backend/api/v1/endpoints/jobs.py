from fastapi import APIRouter, Query
from typing import List, Optional
import requests

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=List[dict])
def get_jobs(
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None)
):
    try:
        r = requests.get(
            "https://remotive.com/api/remote-jobs?category=software-dev&limit=40",
            timeout=5,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        if r.status_code == 200:
            jobs = []
            for j in r.json().get("jobs", []):
                jobs.append({
                    "id": f"remotive-{j.get('id')}",
                    "title": j.get("title", ""),
                    "company": j.get("company_name", ""),
                    "location": j.get("candidate_required_location") or "Remote",
                    "type": j.get("job_type", "full_time").replace("_", " ").title(),
                    "category": j.get("category", "Software Engineering"),
                    "salary": j.get("salary", ""),
                    "tags": j.get("tags", [])[:5],
                    "logo": j.get("company_logo", ""),
                    "url": j.get("url", ""),
                    "postedAt": j.get("publication_date", ""),
                    "source": "Remotive",
                    "remote": True,
                })
            return jobs
    except Exception as e:
        print(f"Error fetching jobs: {e}")

    return [
        {
            "id": "job-1",
            "title": "Senior Full Stack Python & React Engineer",
            "company": "VGyans Tech",
            "location": "Remote / India",
            "type": "Full Time",
            "category": "Software Engineering",
            "salary": "₹18,00,000 - ₹28,00,000 P.A.",
            "tags": ["Python", "FastAPI", "React", "SOLID"],
            "logo": "",
            "url": "https://virtualgyans.me",
            "postedAt": "2026-07-23",
            "source": "VGyans",
            "remote": True
        }
    ]
