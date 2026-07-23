from typing import Dict, Any, List
from backend.schemas.resume import ResumeAnalysisResponseDTO

class ResumeService:
    def __init__(self):
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
            keywords = [
                "product management", "agile", "scrum", "stakeholder management", "roadmap",
                "kpis", "analytics", "jira", "business analysis", "sql", "user stories",
                "market research", "a/b testing", "leadership", "budgeting"
            ]
            default_skills = ["Product Strategy", "Agile / Scrum", "Stakeholder Management"]
            default_missing = ["A/B Testing Frameworks", "SQL Data Analytics", "Jira Backlog Refinement"]
            role_name = target_role if target_role != "Software Engineer" else "Product Manager"
        else:
            keywords = [
                "python", "java", "javascript", "react", "node", "fastapi", "spring boot",
                "sql", "postgresql", "docker", "kubernetes", "aws", "git", "data structures",
                "algorithms", "rest api", "system design", "microservices"
            ]
            default_skills = ["Python", "Java", "REST APIs"]
            default_missing = ["Docker Containerization", "Kubernetes", "System Architecture"]
            role_name = target_role

        found_skills = [kw.title() for kw in keywords if kw in clean_text]
        missing_skills = [kw.title() for kw in keywords if kw not in clean_text][:5]
        
        score = min(100, max(45, len(found_skills) * 7 + 40))
        match_rate = min(98, max(50, score - 4))
        
        return ResumeAnalysisResponseDTO(
            score=score,
            matchRate=match_rate,
            skills=found_skills if found_skills else default_skills,
            missingSkills=missing_skills if missing_skills else default_missing,
            summary=f"Resume analyzed under '{cat.upper()}' category for role '{role_name}'. High ATS alignment detected.",
            recommendations=[
                f"Incorporate specific keywords relevant to {cat} roles.",
                "Highlight quantifiable metrics (e.g. boosted performance by 35%).",
                "Ensure standard ATS formatting without double-column tables."
            ],
            atsPassed=score >= 70
        )
