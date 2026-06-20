from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core.dependencies import require_supabase_configured
from app.schemas.common import APIResponse
from app.schemas.queue import QueueActionRequest, QueueEntryCreateRequest
from app.services.queue_realtime_publisher import (
    QueueRealtimePublisher,
    get_queue_realtime_publisher,
)
from app.services.queue_service import QueueService, get_queue_service

router = APIRouter(prefix="/queue", tags=["Queue"])
SupabaseConfigured = Annotated[None, Depends(require_supabase_configured)]


@router.get(
    "/{unit_id}",
    response_model=APIResponse,
    summary="Consultar snapshot atual da fila",
)
async def get_queue_snapshot(
    unit_id: str,
    _: SupabaseConfigured,
    queue_service: QueueService = Depends(get_queue_service),
) -> APIResponse:
    snapshot = queue_service.get_queue_snapshot(unit_id)
    return APIResponse(
        message="Snapshot estrutural da fila obtido com sucesso.",
        data=snapshot.model_dump(),
    )


@router.post(
    "/entries",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Adicionar pessoa na fila",
)
async def create_queue_entry(
    payload: QueueEntryCreateRequest,
    _: SupabaseConfigured,
    queue_service: QueueService = Depends(get_queue_service),
    realtime_publisher: QueueRealtimePublisher = Depends(get_queue_realtime_publisher),
) -> APIResponse:
    result = queue_service.create_entry(payload)
    await realtime_publisher.publish_queue_update(
        unit_id=result.queue.unit_id,
        queue_service=queue_service,
    )
    return APIResponse(
        message="Pessoa adicionada à fila com sucesso.",
        data=result.model_dump(),
    )


@router.post(
    "/call-next",
    response_model=APIResponse,
    summary="Chamar a próxima senha da fila",
)
async def call_next_entry(
    payload: QueueActionRequest,
    _: SupabaseConfigured,
    queue_service: QueueService = Depends(get_queue_service),
    realtime_publisher: QueueRealtimePublisher = Depends(get_queue_realtime_publisher),
) -> APIResponse:
    result = queue_service.call_next(payload)
    await realtime_publisher.publish_queue_update(
        unit_id=result.queue.unit_id,
        queue_service=queue_service,
    )
    return APIResponse(
        message="Próxima senha chamada com sucesso.",
        data=result.model_dump(),
    )


@router.post(
    "/finish-current",
    response_model=APIResponse,
    summary="Finalizar atendimento atual",
)
async def finish_current_entry(
    payload: QueueActionRequest,
    _: SupabaseConfigured,
    queue_service: QueueService = Depends(get_queue_service),
    realtime_publisher: QueueRealtimePublisher = Depends(get_queue_realtime_publisher),
) -> APIResponse:
    result = queue_service.finish_current(payload)
    await realtime_publisher.publish_queue_update(
        unit_id=result.queue.unit_id,
        queue_service=queue_service,
    )
    return APIResponse(
        message="Atendimento atual finalizado com sucesso.",
        data=result.model_dump(),
    )
