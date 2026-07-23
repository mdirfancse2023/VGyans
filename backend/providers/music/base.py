from abc import ABC, abstractmethod
from typing import List
from backend.schemas.song import SongDTO

class MusicProviderStrategy(ABC):
    @abstractmethod
    def search_tracks(self, query: str, limit: int) -> List[SongDTO]:
        pass
