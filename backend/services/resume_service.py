from typing import Dict, Any, List
from backend.schemas.resume import ResumeAnalysisResponseDTO
from backend.services.resume.tech_resume_service import TechResumeService
from backend.services.resume.management_resume_service import ManagementResumeService

class ResumeService:
    def __init__(self):
        self.tech_service = TechResumeService()
        self.management_service = ManagementResumeService()

        self._categories = [
            {
                "id": "technical",
                "name": "Technical / Software Engineering",
                "icon": "💻",
                "description": "ATS scoring tailored for Full Stack, Backend (Java/Spring Boot/Python), DevOps, and Data Engineering roles."
            },
            {
                "id": "management",
                "name": "Management / Product / Non-Tech",
                "icon": "📊",
                "description": "ATS scoring tailored for Product Managers, Business Analysts, Agile Consultants, and Operations Lead roles."
            }
        ]

    def get_categories(self) -> List[Dict[str, Any]]:
        return self._categories

    def analyze(self, text: str, category: str = "technical", target_role: str = "Software Engineer") -> ResumeAnalysisResponseDTO:
        clean_text = (text or "").lower()
        cat = (category or "technical").lower()
        
        if cat == "management":
            return self.management_service.analyze(clean_text, target_role=target_role)
        
        return self.tech_service.analyze(clean_text, target_role=target_role)
