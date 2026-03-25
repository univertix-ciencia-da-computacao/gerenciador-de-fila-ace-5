from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.dependencies import require_supabase_configured
from app.schemas.common import APIResponse
from app.services.queue_service import QueueService, get_queue_service

router = APIRouter(prefix="/position", tags=["Position"])
SupabaseConfigured = Annotated[None, Depends(require_supabase_configured)]


@router.get(
    "/{token}",
    response_model=APIResponse,
    summary="Consultar a posição atual de uma senha",
)
async def get_position(
    token: str,
    _: SupabaseConfigured,
    queue_service: QueueService = Depends(get_queue_service),
) -> APIResponse:
    snapshot = queue_service.get_position_snapshot(token)
    return APIResponse(
        message="Posição consultada com sucesso.",
        data=snapshot.model_dump(),
    )
