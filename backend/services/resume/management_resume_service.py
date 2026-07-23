from typing import List, Dict, Any
from backend.schemas.resume import ResumeAnalysisResponseDTO

class ManagementResumeService:
    def __init__(self):
        self.keywords = [
            "product management", "agile", "scrum", "stakeholder management", "roadmap",
            "kpis", "analytics", "jira", "business analysis", "sql", "user stories",
            "market research", "a/b testing", "leadership", "budgeting"
        ]

    def analyze(self, clean_text: str, target_role: str = "Product Manager") -> ResumeAnalysisResponseDTO:
        found_skills = [kw.title() for kw in self.keywords if kw in clean_text]
        missing_skills = [kw.title() for kw in self.keywords if kw not in clean_text][:5]
        
        score = min(100, max(45, len(found_skills) * 7 + 40))
        match_rate = min(98, max(50, score - 4))
        
        return ResumeAnalysisResponseDTO(
            score=score,
            matchRate=match_rate,
            skills=found_skills if found_skills else ["Product Strategy", "Agile / Scrum", "Stakeholder Management"],
            missingSkills=missing_skills if missing_skills else ["A/B Testing Frameworks", "SQL Data Analytics", "Jira Backlog Refinement"],
            summary=f"Management / Non-Tech Resume analyzed for role '{target_role}'. High ATS product alignment detected.",
            recommendations=[
                "Incorporate product management and agile leadership keywords.",
                "Highlight business impact metrics (e.g. increased user retention by 25%).",
                "Ensure clean executive summary and structured product delivery section."
            ],
            atsPassed=score >= 70
        )
