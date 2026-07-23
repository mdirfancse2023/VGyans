from typing import List, Dict, Any

class CSFundamentalsService:
    def __init__(self):
        self._data = {
            "category": "cs-fundamentals",
            "name": "CS Core Fundamentals",
            "icon": "🧠",
            "roadmap": [
                {
                    "step": 1,
                    "title": "OS & System Threading",
                    "timeline": "Week 1",
                    "topics": ["Process vs Thread", "Deadlocks", "Paging & Memory Management"],
                    "description": "Core operating system concepts frequently asked in technical interviews."
                },
                {
                    "step": 2,
                    "title": "DBMS, SQL & Indexing",
                    "timeline": "Week 2",
                    "topics": ["ACID Properties", "B-Trees", "SQL Joins", "Normalization"],
                    "description": "Master relational database architecture, query optimization, and transaction safety."
                }
            ],
            "resources": [
                {"title": "System Design Handbook (LLD & HLD)", "type": "PDF", "link": "https://virtualgyans.me"},
                {"title": "OS & DBMS Revision Notes", "type": "Notes", "link": "https://virtualgyans.me"}
            ]
        }

    def get_data(self) -> Dict[str, Any]:
        return self._data
