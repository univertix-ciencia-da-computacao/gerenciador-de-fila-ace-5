import logging

from fastapi import FastAPI

from app.core.config import get_settings
from app.core.error_handlers import register_exception_handlers
from app.routes.health import router as health_router
from app.routes.position import router as position_router
from app.routes.queue import router as queue_router
from app.routes.websocket import router as websocket_router
from app.schemas.common import APIResponse

logging.basicConfig(level=logging.INFO)
settings = get_settings()


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "ACE API para gerenciamento de filas com comandos HTTP e sincronização "
            "em tempo real via WebSocket."
        ),
        docs_url="/docs",
        redoc_url=None,
        openapi_url=f"{settings.api_prefix}/openapi.json",
    )

    register_exception_handlers(application)

    application.include_router(health_router, prefix=settings.api_prefix)
    application.include_router(queue_router, prefix=settings.api_prefix)
    application.include_router(position_router, prefix=settings.api_prefix)
    application.include_router(websocket_router, prefix=settings.api_prefix)

    @application.get("/", response_model=APIResponse, tags=["Root"])
    async def root() -> APIResponse:
        return APIResponse(
            message="API inicial disponível.",
            data={
                "docs": "/docs",
                "health": f"{settings.api_prefix}/health",
                "queue": f"{settings.api_prefix}/queue/default",
                "position_example": f"{settings.api_prefix}/position/<token>",
                "websocket": f"{settings.api_prefix}/ws",
            },
        )

    return application


app = create_application()
