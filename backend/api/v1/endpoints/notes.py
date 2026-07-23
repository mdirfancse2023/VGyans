from fastapi import APIRouter, HTTPException
from typing import List, Optional

router = APIRouter(tags=["Study Notes & Resources"])

NOTES_DB = [
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

RESOURCES_DB = [
    {
        "id": "res-1",
        "title": "Data Structures & Algorithms Cheat Sheet",
        "category": "Placement Prep",
        "type": "PDF",
        "link": "https://virtualgyans.me"
    }
]

@router.get("/notes")
def get_notes():
    return NOTES_DB

@router.get("/notes/{note_id}")
def get_note_by_id(note_id: str):
    for n in NOTES_DB:
        if n["id"] == note_id:
            return n
    raise HTTPException(status_code=404, detail="Note not found")

@router.get("/resources")
def get_resources():
    return RESOURCES_DB
