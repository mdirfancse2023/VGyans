from fastapi import APIRouter, Query
from typing import List, Optional

try:
    from backend.schemas.song import SongDTO
    from backend.services.song_service import SongService
except ModuleNotFoundError:
    from schemas.song import SongDTO
    from services.song_service import SongService

router = APIRouter(prefix="/songs", tags=["Songs"])
song_service = SongService()

@router.get("", response_model=List[SongDTO])
def get_songs(
    query: Optional[str] = Query("latest hindi songs", description="Song or category search query"),
    max_results: int = Query(10, description="Max tracks to return (clamped to 10)")
):
    return song_service.get_songs(query=query or "latest hindi songs", max_results=max_results)
