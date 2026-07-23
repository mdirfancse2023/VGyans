from pydantic import BaseModel, Field
from typing import Optional

class SongDTO(BaseModel):
    id: str
    spotifyId: str
    title: str
    artist: str
    album: str
    category: str
    coverUrl: str
    audioUrl: str
    url: str
    embedUrl: str
    duration: int
    provider: str = "spotify"
