from typing import List, Dict, Any, Optional

class PlacementService:
    def __init__(self):
        self._categories = [
            {
                "id": "dsa",
                "name": "DSA & Problem Solving",
                "icon": "⚡",
                "description": "LeetCode curated patterns, Data Structures, Algorithms & live practice questions."
            },
            {
                "id": "cs-fundamentals",
                "name": "CS Core Fundamentals",
                "icon": "🧠",
                "description": "Operating Systems, DBMS & SQL, Computer Networks, and Low Level System Design."
            },
            {
                "id": "jobs",
                "name": "Off-Campus Jobs & Hiring",
                "icon": "💼",
                "description": "Direct off-campus openings, remote software roles, and tech hiring portals."
            },
            {
                "id": "interviews",
                "name": "Mock Interviews & Experiences",
                "icon": "🎯",
                "description": "FAANG & Tier-1 company mock rounds, student interview logs, and HR preparation."
            }
        ]

        self._placement_data = {
            "dsa": {
                "roadmap": [
                    {"step": 1, "title": "Array & String Patterns", "timeline": "Week 1-2", "topics": ["Two Pointers", "Sliding Window", "Prefix Sum"], "description": "Master foundational array manipulation techniques required by top recruiters."},
                    {"step": 2, "title": "Trees, Graphs & Dynamic Programming", "timeline": "Week 3-6", "topics": ["Binary Search Trees", "Graph Traversal (BFS/DFS)", "DP Memoization"], "description": "Conquer medium-to-hard graph algorithms and state transitions."}
                ],
                "resources": [
                    {"title": "LeetCode 150 Blind Cheat Sheet", "type": "PDF", "link": "https://virtualgyans.me"},
                    {"title": "Dynamic Programming Masterclass", "type": "Guide", "link": "https://virtualgyans.me"}
                ]
            },
            "cs-fundamentals": {
                "roadmap": [
                    {"step": 1, "title": "OS & System Threading", "timeline": "Week 1", "topics": ["Process vs Thread", "Deadlocks", "Paging & Memory Management"], "description": "Core operating system concepts frequently asked in technical interviews."},
                    {"step": 2, "title": "DBMS, SQL & Indexing", "timeline": "Week 2", "topics": ["ACID Properties", "B-Trees", "SQL Joins", "Normalization"], "description": "Master relational database architecture, query optimization, and transaction safety."}
                ],
                "resources": [
                    {"title": "System Design Handbook (LLD & HLD)", "type": "PDF", "link": "https://virtualgyans.me"},
                    {"title": "OS & DBMS Revision Notes", "type": "Notes", "link": "https://virtualgyans.me"}
                ]
            },
            "jobs": {
                "roadmap": [
                    {"step": 1, "title": "Off-Campus Resume Blast", "timeline": "Ongoing", "topics": ["LinkedIn Sourcing", "Referral Outreach", "Cold Emailing"], "description": "Strategic framework to get 10x higher response rates for off-campus roles."},
                    {"step": 2, "title": "Portal Applications & Tracking", "timeline": "Weekly", "topics": ["Remotive", "Arbeitnow", "Glassdoor"], "description": "Daily job application strategy across verified hiring platforms."}
                ],
                "resources": [
                    {"title": "Tech Off-Campus Job Portal Tracker", "type": "Tracker", "link": "https://virtualgyans.me"}
                ]
            },
            "interviews": {
                "roadmap": [
                    {"step": 1, "title": "Behavioral & STAR Method", "timeline": "Week 1", "topics": ["Amazon Leadership Principles", "Conflict Resolution", "Project Pitch"], "description": "Master behavioral interview questions with structured STAR answers."},
                    {"step": 2, "title": "Live Coding & Bar Raiser Mocks", "timeline": "Week 2", "topics": ["Mock Coding Sessions", "System Architecture Pitch"], "description": "Simulated technical rounds under real interview time constraints."}
                ],
                "experiences": [
                    {"id": "exp-1", "company": "Google", "role": "Software Engineer (SDE-1)", "package": "INR 32,00,000 P.A.", "rounds": ["Online Assessment", "Technical Round 1 (Trees & Graphs)", "Technical Round 2 (DP)", "Googliness HR Round"], "tips": ["Focus on clean code, edge case handling, and explaining your thought process out loud."], "date": "2026-07-20"},
                    {"id": "exp-2", "company": "Amazon", "role": "Software Development Engineer-I", "package": "INR 28,00,000 P.A.", "rounds": ["OA Coding & Work Simulation", "Technical Round 1 (System Design & LLD)", "Technical Round 2 (Bar Raiser)"], "tips": ["Memorize Amazon Leadership Principles and prepare STAR format behavioral stories."], "date": "2026-07-18"}
                ],
                "mock_interviews": [
                    {"id": "mock-1", "companyCategory": "Product Based (FAANG)", "difficulty": "Hard", "questions": ["Implement a Least Recently Used (LRU) Cache with O(1) complexity.", "Serialize and Deserialize a Binary Tree.", "Design a Rate Limiter system using Token Bucket."]},
                    {"id": "mock-2", "companyCategory": "Service Based (TCS / Infosys)", "difficulty": "Medium", "questions": ["Write a program to reverse a linked list.", "Explain OOPs concepts with real-world Java examples.", "What is SQL JOIN and what are its types?"]}
                ]
            }
        }

    def get_categories(self) -> List[Dict[str, Any]]:
        return self._categories

    def get_placement_by_category(self, category_id: Optional[str] = None) -> Dict[str, Any]:
        cid = (category_id or "dsa").lower()
        if cid in self._placement_data:
            return {
                "category": cid,
                "data": self._placement_data[cid]
            }
        return {
            "category": "all",
            "data": self._placement_data
        }

    def get_roadmap(self) -> List[Dict[str, Any]]:
        combined = []
        for cat in self._placement_data.values():
            combined.extend(cat.get("roadmap", []))
        return combined

    def get_experiences(self) -> List[Dict[str, Any]]:
        return self._placement_data["interviews"]["experiences"]

    def get_mock_interviews(self) -> List[Dict[str, Any]]:
        return self._placement_data["interviews"]["mock_interviews"]
