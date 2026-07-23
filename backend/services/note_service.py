import json
import os
from typing import List, Optional, Dict, Any

class NoteService:
    def __init__(self):
        # Load resources.json if available
        json_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "data", "resources.json")
        loaded_resources = []
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    loaded_resources = json.load(f)
            except Exception as e:
                print(f"Error loading resources.json: {e}")

        # Default fallback list including all 28 System Design Chapters
        system_design_chapters = [
            {"id": f"system-design-chapter-{i}", "title": f"System Design: Chapter {i}", "category": "Technical", "company": "All", "description": f"Comprehensive System Design study guide for Chapter {i} covering distributed architecture and scalability.", "downloadUrl": f"/notes/system-design-chapter-{i}", "tags": ["System Design", "Scalability", "Architecture"]}
            for i in range(1, 29)
        ]

        if not loaded_resources:
            loaded_resources = system_design_chapters

        self._all_resources = loaded_resources

        # Process notes with full chapter support
        self._notes = []
        for r in loaded_resources:
            dl_url = r.get("downloadUrl", "")
            if dl_url.startswith("/notes/") or r.get("id", "").startswith("system-design") or "notes" in r.get("id", ""):
                note_id = r.get("id") or dl_url.replace("/notes/", "")
                
                # Build chapters list
                chapters = [
                    {"title": f"Section 1: Overview & Functional Requirements", "content": f"High level architectural overview of {r.get('title')}. Focus on throughput, latency, and SLA."},
                    {"title": f"Section 2: High Level System Architecture (HLD)", "content": f"Component design for {r.get('title')} including Load Balancer, API Gateway, Services, Caching, and Storage."},
                    {"title": f"Section 3: Deep Dive & Scalability", "content": f"Handling high QPS, data partitioning, database sharding, and fault tolerance."}
                ]
                
                self._notes.append({
                    "id": note_id,
                    "title": r.get("title"),
                    "subject": "System Design" if "system-design" in note_id else r.get("category", "Technical"),
                    "author": "VGyans Academic Team",
                    "pdfUrl": "https://raw.githubusercontent.com/mdirfancse2023/mdirfancse2023.github.io/main/public/sample.pdf",
                    "description": r.get("description"),
                    "tags": r.get("tags", []),
                    "chapters": chapters
                })

        # Ensure at least note-1 is present for compatibility
        if not any(n["id"] == "note-1" for n in self._notes):
            self._notes.insert(0, {
                "id": "note-1",
                "title": "SOLID Design Principles Handbook",
                "subject": "System Design",
                "author": "VGyans Academic Team",
                "pdfUrl": "https://raw.githubusercontent.com/mdirfancse2023/mdirfancse2023.github.io/main/public/sample.pdf",
                "description": "Comprehensive reference guide covering SRP, OCP, LSP, ISP, and DIP with real-world enterprise code examples.",
                "tags": ["System Design", "SOLID"],
                "chapters": [
                    {"title": "Chapter 1: Single Responsibility Principle (SRP)", "content": "A class or component should have one, and only one, reason to change."},
                    {"title": "Chapter 2: Open/Closed Principle (OCP)", "content": "Software entities should be open for extension, but closed for modification."}
                ]
            })

    def get_notes(self) -> List[Dict[str, Any]]:
        return self._notes

    def get_note_by_id(self, note_id: str) -> Optional[Dict[str, Any]]:
        for n in self._notes:
            if n["id"] == note_id or note_id in n["id"]:
                return n
        # Fallback search by title
        for n in self._notes:
            if note_id.replace('-', ' ') in n["title"].lower():
                return n
        return self._notes[0]

    def get_resources(self) -> List[Dict[str, Any]]:
        return self._all_resources
