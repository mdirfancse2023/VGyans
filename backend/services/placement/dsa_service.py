from typing import List, Dict, Any

class DSAService:
    def __init__(self):
        self._data = {
            "category": "dsa",
            "name": "DSA & Problem Solving",
            "icon": "⚡",
            "roadmap": [
                {
                    "step": 1,
                    "title": "Array & String Patterns",
                    "timeline": "Week 1-2",
                    "topics": ["Two Pointers", "Sliding Window", "Prefix Sum"],
                    "description": "Master foundational array manipulation techniques required by top recruiters."
                },
                {
                    "step": 2,
                    "title": "Trees, Graphs & Dynamic Programming",
                    "timeline": "Week 3-6",
                    "topics": ["Binary Search Trees", "Graph Traversal (BFS/DFS)", "DP Memoization"],
                    "description": "Conquer medium-to-hard graph algorithms and state transitions."
                }
            ],
            "resources": [
                {"title": "LeetCode 150 Blind Cheat Sheet", "type": "PDF", "link": "https://virtualgyans.me"},
                {"title": "Dynamic Programming Masterclass", "type": "Guide", "link": "https://virtualgyans.me"}
            ]
        }

    def get_data(self) -> Dict[str, Any]:
        return self._data
