"""
VGyans FastAPI Backend Entrypoint (SOLID Architecture)
Delegates to modular backend.main app factory.
"""
from backend.main import app

__all__ = ["app"]
