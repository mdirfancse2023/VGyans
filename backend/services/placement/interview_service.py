from typing import List, Dict, Any

class InterviewService:
    def __init__(self):
        self._data = {
            "category": "interviews",
            "name": "Mock Interviews & Experiences",
            "icon": "🎯",
            "roadmap": [
                {
                    "step": 1,
                    "title": "Behavioral & STAR Method",
                    "timeline": "Week 1",
                    "topics": ["Amazon Leadership Principles", "Conflict Resolution", "Project Pitch"],
                    "description": "Master behavioral interview questions with structured STAR answers."
                },
                {
                    "step": 2,
                    "title": "Live Coding & Bar Raiser Mocks",
                    "timeline": "Week 2",
                    "topics": ["Mock Coding Sessions", "System Architecture Pitch"],
                    "description": "Simulated technical rounds under real interview time constraints."
                }
            ],
            "experiences": [
                {
                    "id": "exp-1",
                    "company": "Google",
                    "role": "Software Engineer (SDE-1)",
                    "package": "INR 32,00,000 P.A.",
                    "rounds": ["Online Assessment", "Technical Round 1 (Trees & Graphs)", "Technical Round 2 (DP)", "Googliness HR Round"],
                    "tips": ["Focus on clean code, edge case handling, and explaining your thought process out loud."],
                    "date": "2026-07-20"
                },
                {
                    "id": "exp-2",
                    "company": "Amazon",
                    "role": "Software Development Engineer-I",
                    "package": "INR 28,00,000 P.A.",
                    "rounds": ["OA Coding & Work Simulation", "Technical Round 1 (System Design & LLD)", "Technical Round 2 (Bar Raiser)"],
                    "tips": ["Memorize Amazon Leadership Principles and prepare STAR format behavioral stories."],
                    "date": "2026-07-18"
                }
            ],
            "mock_interviews": [
                {
                    "id": "mock-1",
                    "companyCategory": "Product Based (FAANG)",
                    "difficulty": "Hard",
                    "questions": [
                        "Implement a Least Recently Used (LRU) Cache with O(1) complexity.",
                        "Serialize and Deserialize a Binary Tree.",
                        "Design a Rate Limiter system using Token Bucket."
                    ]
                },
                {
                    "id": "mock-2",
                    "companyCategory": "Service Based (TCS / Infosys)",
                    "difficulty": "Medium",
                    "questions": [
                        "Write a program to reverse a linked list.",
                        "Explain OOPs concepts with real-world Java examples.",
                        "What is SQL JOIN and what are its types?"
                    ]
                }
            ]
        }

    def get_data(self) -> Dict[str, Any]:
        return self._data

    def get_experiences(self) -> List[Dict[str, Any]]:
        return self._data["experiences"]

    def get_mock_interviews(self) -> List[Dict[str, Any]]:
        return self._data["mock_interviews"]
