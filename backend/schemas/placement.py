from pydantic import BaseModel
from typing import List, Optional

class PlacementRoadmapDTO(BaseModel):
    step: int
    title: str
    timeline: str
    topics: List[str]
    description: str

class InterviewExperienceDTO(BaseModel):
    id: str
    company: str
    role: str
    package: str
    rounds: List[str]
    tips: List[str]
    date: str

class MockInterviewDTO(BaseModel):
    id: str
    companyCategory: str
    difficulty: str
    questions: List[str]
