from fastapi import APIRouter

try:
    from backend.routers.v1.endpoints import songs, jobs, news, resume, questions, notes, placement, copilot, runner, system
except ModuleNotFoundError:
    from .endpoints import songs, jobs, news, resume, questions, notes, placement, copilot, runner, system

api_router = APIRouter()
api_router.include_router(songs.router)
api_router.include_router(jobs.router)
api_router.include_router(news.router)
api_router.include_router(resume.router)
api_router.include_router(questions.router)
api_router.include_router(notes.router)
api_router.include_router(placement.router)
api_router.include_router(copilot.router)
api_router.include_router(runner.router)
api_router.include_router(system.router)
