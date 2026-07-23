from typing import List, Optional
from backend.schemas.placement import PlacementRoadmapDTO, InterviewExperienceDTO, MockInterviewDTO

class PlacementService:
    def __init__(self):
        self._roadmap = [
            PlacementRoadmapDTO(
                step=1,
                title="Data Structures & Algorithms Mastery",
                timeline="Months 1-2",
                topics=["Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming"],
                description="Master core problem solving with 150+ LeetCode curated interview questions."
            ),
            PlacementRoadmapDTO(
                step=2,
                title="CS Fundamentals & System Design",
                timeline="Month 3",
                topics=["Operating Systems", "DBMS & SQL", "Computer Networks", "Low Level Design"],
                description="Consolidate core computer science concepts for technical interview rounds."
            ),
            PlacementRoadmapDTO(
                step=3,
                title="ATS Resume Optimization & Projects",
                timeline="Month 4",
                topics=["Full Stack Spring Boot / Python", "Docker", "REST APIs", "Portfolio Web App"],
                description="Build production-grade projects and tailor your resume for ATS scanners."
            ),
            PlacementRoadmapDTO(
                step=4,
                title="Mock Interviews & HR Preparation",
                timeline="Month 5",
                topics=["Behavioral Round", "System Design Pitch", "Live Coding Practice"],
                description="Participate in live mock interview sessions and refine communication skills."
            )
        ]

        self._experiences = [
            InterviewExperienceDTO(
                id="exp-1",
                company="Google",
                role="Software Development Engineer (SDE-1)",
                package="₹32,00,000 P.A.",
                rounds=["Online Assessment", "Technical Round 1 (Trees & Graphs)", "Technical Round 2 (DP)", "Googliness HR Round"],
                tips=["Focus on clean code, edge case handling, and explaining your thought process out loud."],
                date="2026-07-20"
            ),
            InterviewExperienceDTO(
                id="exp-2",
                company="Amazon",
                role="Software Development Engineer-I",
                package="₹28,00,000 P.A.",
                rounds=["OA Coding & Work Simulation", "Technical Round 1 (System Design & LLD)", "Technical Round 2 (Bar Raiser)"],
                tips=["Memorize Amazon Leadership Principles and prepare STAR format behavioral stories."],
                date="2026-07-18"
            )
        ]

        self._mock_interviews = [
            MockInterviewDTO(
                id="mock-1",
                companyCategory="Product Based (FAANG)",
                difficulty="Hard",
                questions=[
                    "Implement a Least Recently Used (LRU) Cache with O(1) time complexity.",
                    "Serialize and Deserialize a Binary Tree.",
                    "Design a Rate Limiter system using Token Bucket algorithm."
                ]
            ),
            MockInterviewDTO(
                id="mock-2",
                companyCategory="Service Based (TCS / Infosys)",
                difficulty="Medium",
                questions=[
                    "Write a program to reverse a linked list.",
                    "Explain OOPs concepts with real-world Java examples.",
                    "What is SQL JOIN and what are its types?"
                ]
            )
        ]

    def get_roadmap(self) -> List[PlacementRoadmapDTO]:
        return self._roadmap

    def get_experiences(self) -> List[InterviewExperienceDTO]:
        return self._experiences

    def get_mock_interviews(self) -> List[MockInterviewDTO]:
        return self._mock_interviews
