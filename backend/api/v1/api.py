from fastapi import APIRouter
from backend.api.v1.endpoints import songs, jobs, system

api_router = APIRouter()
api_router.include_router(songs.router)
api_router.include_router(jobs.router)
api_router.include_router(system.router)
