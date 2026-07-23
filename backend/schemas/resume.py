from pydantic import BaseModel
from typing import List, Optional

class ResumeAnalysisResponseDTO(BaseModel):
    score: int
    matchRate: int
    skills: List[str]
    missingSkills: List[str]
    summary: str
    recommendations: List[str]
    atsPassed: bool
