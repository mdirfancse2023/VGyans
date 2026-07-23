from fastapi import APIRouter, HTTPException
from typing import List, Optional

try:
    from services.note_service import NoteService
except ModuleNotFoundError:
    from backend.services.note_service import NoteService

router = APIRouter(tags=["Study Notes & Resources"])
note_service = NoteService()

@router.get("/notes")
def get_notes():
    return note_service.get_notes()

@router.get("/notes/{note_id}")
def get_note_by_id(note_id: str):
    note = note_service.get_note_by_id(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.get("/resources")
def get_resources():
    return note_service.get_resources()
