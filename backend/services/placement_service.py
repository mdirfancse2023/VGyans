from typing import List, Dict, Any, Optional
from backend.services.placement.dsa_service import DSAService
from backend.services.placement.cs_fundamentals_service import CSFundamentalsService
from backend.services.placement.job_placement_service import JobPlacementService
from backend.services.placement.interview_service import InterviewService

class PlacementService:
    def __init__(self):
        self.dsa_service = DSAService()
        self.cs_fundamentals_service = CSFundamentalsService()
        self.job_placement_service = JobPlacementService()
        self.interview_service = InterviewService()

        self._services = {
            "dsa": self.dsa_service,
            "cs-fundamentals": self.cs_fundamentals_service,
            "jobs": self.job_placement_service,
            "interviews": self.interview_service
        }

    def get_categories(self) -> List[Dict[str, Any]]:
        categories = []
        for s in self._services.values():
            data = s.get_data()
            categories.append({
                "id": data["category"],
                "name": data["name"],
                "icon": data["icon"]
            })
        return categories

    def get_placement_by_category(self, category_id: Optional[str] = None) -> Dict[str, Any]:
        cid = (category_id or "dsa").lower()
        if cid in self._services:
            return {
                "category": cid,
                "data": self._services[cid].get_data()
            }
        return {
            "category": "all",
            "data": {k: v.get_data() for k, v in self._services.items()}
        }

    def get_roadmap(self) -> List[Dict[str, Any]]:
        combined = []
        for s in self._services.values():
            combined.extend(s.get_data().get("roadmap", []))
        return combined

    def get_experiences(self) -> List[Dict[str, Any]]:
        return self.interview_service.get_experiences()

    def get_mock_interviews(self) -> List[Dict[str, Any]]:
        return self.interview_service.get_mock_interviews()
