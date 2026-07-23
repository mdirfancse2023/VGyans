import os

class Settings:
    PROJECT_NAME: str = "VGyans API"
    VERSION: str = "4.0.0"
    API_V1_STR: str = "/api"

    SPOTIFY_CLIENT_ID: str = os.getenv("SPOTIFY_CLIENT_ID") or os.getenv("VITE_SPOTIFY_CLIENT_ID") or "ba75cb280ed54a35b755e4d562d08260"
    SPOTIFY_CLIENT_SECRET: str = os.getenv("SPOTIFY_CLIENT_SECRET") or os.getenv("VITE_SPOTIFY_CLIENT_SECRET") or "40a7ab923a1e412f899f1d9cf9b23983"
    GNEWS_API_KEY: str = os.getenv("GNEWS_API_KEY") or os.getenv("VITE_GNEWS_API_KEY") or ""
    RAPIDAPI_KEY: str = os.getenv("RAPIDAPI_KEY") or ""

settings = Settings()
