from typing import List, Optional, Dict, Any

class NoteService:
    def __init__(self):
        self._notes = [
            {
                "id": "note-1",
                "title": "SOLID Design Principles Handbook",
                "subject": "System Design",
                "author": "VGyans Academic Team",
                "pdfUrl": "https://raw.githubusercontent.com/mdirfancse2023/mdirfancse2023.github.io/main/public/sample.pdf",
                "description": "Comprehensive reference guide covering SRP, OCP, LSP, ISP, and DIP with real-world enterprise code examples."
            },
            {
                "id": "note-2",
                "title": "Spring Boot 4.0 Microservices Architecture",
                "subject": "Backend Development",
                "author": "VGyans Engineering",
                "pdfUrl": "https://raw.githubusercontent.com/mdirfancse2023/mdirfancse2023.github.io/main/public/sample.pdf",
                "description": "Production setup for Java 21, Resilience4j circuit breakers, and SLF4J MDC request correlation tracing."
            }
        ]

        self._resources = [
            {
                "id": "res-1",
                "title": "Data Structures & Algorithms Cheat Sheet",
                "category": "Placement Prep",
                "type": "PDF",
                "link": "https://virtualgyans.me"
            }
        ]

    def get_notes(self) -> List[Dict[str, Any]]:
        return self._notes

    def get_note_by_id(self, note_id: str) -> Optional[Dict[str, Any]]:
        for n in self._notes:
            if n["id"] == note_id:
                return n
        return None

    def get_resources(self) -> List[Dict[str, Any]]:
        return self._resources
