from typing import List, Optional, Dict, Any
from .resources_data import SYSTEM_DESIGN_CHAPTERS

class NoteService:
    def __init__(self):
        self._all_resources = SYSTEM_DESIGN_CHAPTERS
        self._notes = []

        for r in SYSTEM_DESIGN_CHAPTERS:
            note_id = r["id"]
            chapters = [
                {"title": f"Section 1: Overview & Functional Requirements", "content": f"High level architectural overview of {r['title']}. Focus on throughput, latency, and SLA guarantees."},
                {"title": f"Section 2: High Level System Architecture (HLD)", "content": f"Component design for {r['title']} including Load Balancer, API Gateway, Microservices, Caching (Redis), and Storage."},
                {"title": f"Section 3: Deep Dive & Scalability", "content": f"Handling high QPS, data partitioning, database sharding, and fault tolerance."}
            ]
            self._notes.append({
                "id": note_id,
                "title": r["title"],
                "subject": "System Design",
                "author": "VGyans Academic Team",
                "pdfUrl": "https://raw.githubusercontent.com/mdirfancse2023/mdirfancse2023.github.io/main/public/sample.pdf",
                "description": r["description"],
                "tags": r["tags"],
                "chapters": chapters
            })

    def get_notes(self) -> List[Dict[str, Any]]:
        return self._notes

    def get_note_by_id(self, note_id: str) -> Optional[Dict[str, Any]]:
        for n in self._notes:
            if n["id"] == note_id or note_id in n["id"]:
                return n
        for n in self._notes:
            if note_id.replace('-', ' ') in n["title"].lower():
                return n
        return self._notes[0]

    def get_resources(self) -> List[Dict[str, Any]]:
        return self._all_resources
