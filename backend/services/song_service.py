from typing import List
from backend.providers.music.base import MusicProviderStrategy
from backend.providers.music.spotify import SpotifyMusicProvider
from backend.schemas.song import SongDTO

class SongService:
    def __init__(self, provider: MusicProviderStrategy = None):
        self.provider = provider or SpotifyMusicProvider()

    def get_songs(self, query: str = "latest hindi songs", max_results: int = 10) -> List[SongDTO]:
        return self.provider.search_tracks(query=query, limit=max_results)
