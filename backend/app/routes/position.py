from fastapi import APIRouter, Depends

from app.schemas.common import APIResponse
from app.services.queue_service import QueueService, get_queue_service

router = APIRouter(prefix="/position", tags=["Position"])


@router.get(
    "/{token}",
    response_model=APIResponse,
    summary="Consultar a posição atual de uma senha",
)
async def get_position(
    token: str,
    queue_service: QueueService = Depends(get_queue_service),
) -> APIResponse:
    snapshot = queue_service.get_position_snapshot(token)
    return APIResponse(
        message="Posição consultada com sucesso.",
        data=snapshot.model_dump(),
    )
