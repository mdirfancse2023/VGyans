from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.routers.v1.api import api_router
    from backend.core.config import settings
except ModuleNotFoundError:
    from routers.v1.api import api_router
    from core.config import settings

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url="/api/openapi.json"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/")
    def root():
        return {
            "status": "online",
            "app": settings.PROJECT_NAME,
            "architecture": "SOLID Modular Python FastAPI Architecture",
            "version": settings.VERSION
        }

    return app

app = create_app()
