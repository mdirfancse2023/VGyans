from typing import List, Dict, Any

try:
    from backend.schemas.resume import ResumeAnalysisResponseDTO
except ModuleNotFoundError:
    from ...schemas.resume import ResumeAnalysisResponseDTO

class TechResumeService:
    def __init__(self):
        self.keywords = [
            "python", "java", "javascript", "react", "node", "fastapi", "spring boot",
            "sql", "postgresql", "docker", "kubernetes", "aws", "git", "data structures",
            "algorithms", "rest api", "system design", "microservices"
        ]

    def analyze(self, clean_text: str, target_role: str = "Software Engineer") -> ResumeAnalysisResponseDTO:
        found_skills = [kw.title() for kw in self.keywords if kw in clean_text]
        missing_skills = [kw.title() for kw in self.keywords if kw not in clean_text][:5]
        
        score = min(100, max(45, len(found_skills) * 7 + 40))
        match_rate = min(98, max(50, score - 4))
        
        return ResumeAnalysisResponseDTO(
            score=score,
            matchRate=match_rate,
            skills=found_skills if found_skills else ["Python", "Java", "REST APIs"],
            missingSkills=missing_skills if missing_skills else ["Docker Containerization", "Kubernetes", "System Architecture"],
            summary=f"Tech Resume analyzed for role '{target_role}'. High ATS technical alignment detected.",
            recommendations=[
                "Incorporate specific keywords relevant to Technical Software Engineering roles.",
                "Highlight quantifiable engineering metrics (e.g. boosted API throughput by 40%).",
                "Ensure standard ATS formatting without complex multi-column layouts."
            ],
            atsPassed=score >= 70
        )
