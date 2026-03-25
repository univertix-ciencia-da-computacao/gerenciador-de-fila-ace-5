from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.common import APIResponse
from app.schemas.health import HealthData

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=APIResponse, summary="Health check da aplicação")
async def health_check() -> APIResponse:
    settings = get_settings()
    health_data = HealthData(
        status="ok",
        app_name=settings.app_name,
        version=settings.app_version,
        supabase_configured=settings.supabase_enabled,
    )
    return APIResponse(
        message="API operacional.",
        data=health_data.model_dump(),
    )
