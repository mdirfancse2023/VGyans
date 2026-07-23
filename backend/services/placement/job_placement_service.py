from typing import List, Dict, Any

class JobPlacementService:
    def __init__(self):
        self._data = {
            "category": "jobs",
            "name": "Off-Campus Jobs & Hiring",
            "icon": "💼",
            "roadmap": [
                {
                    "step": 1,
                    "title": "Off-Campus Resume Blast",
                    "timeline": "Ongoing",
                    "topics": ["LinkedIn Sourcing", "Referral Outreach", "Cold Emailing"],
                    "description": "Strategic framework to get 10x higher response rates for off-campus roles."
                },
                {
                    "step": 2,
                    "title": "Portal Applications & Tracking",
                    "timeline": "Weekly",
                    "topics": ["Remotive", "Arbeitnow", "Glassdoor"],
                    "description": "Daily job application strategy across verified hiring platforms."
                }
            ],
            "resources": [
                {"title": "Tech Off-Campus Job Portal Tracker", "type": "Tracker", "link": "https://virtualgyans.me"}
            ]
        }

    def get_data(self) -> Dict[str, Any]:
        return self._data
