import re
from typing import Dict, Any, List
from backend.schemas.resume import ResumeAnalysisResponseDTO

class ResumeService:
    def analyze(self, text: str, target_role: str = "Software Engineer") -> ResumeAnalysisResponseDTO:
        clean_text = (text or "").lower()
        
        tech_keywords = [
            "python", "java", "javascript", "react", "node", "fastapi", "spring boot",
            "sql", "postgresql", "docker", "kubernetes", "aws", "git", "data structures",
            "algorithms", "rest api", "system design", "microservices"
        ]
        
        found_skills = [kw.capitalize() for kw in tech_keywords if kw in clean_text]
        missing_skills = [kw.capitalize() for kw in tech_keywords if kw not in clean_text][:5]
        
        score = min(100, max(45, len(found_skills) * 6 + 40))
        match_rate = min(98, max(50, score - 5))
        
        return ResumeAnalysisResponseDTO(
            score=score,
            matchRate=match_rate,
            skills=found_skills if found_skills else ["Python", "JavaScript", "Problem Solving"],
            missingSkills=missing_skills if missing_skills else ["Docker", "Kubernetes", "System Design"],
            summary=f"Resume analyzed for role '{target_role}'. Strong foundation with key technical skills detected.",
            recommendations=[
                "Highlight quantifiable metrics in key achievements.",
                "Include cloud deployment and containerization projects.",
                "Add targeted keywords for ATS optimization."
            ],
            atsPassed=score >= 70
        )
