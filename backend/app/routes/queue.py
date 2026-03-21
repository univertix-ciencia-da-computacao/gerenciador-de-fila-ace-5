from fastapi import APIRouter, Depends, status

from app.schemas.common import APIResponse
from app.schemas.queue import QueueActionRequest, QueueEntryCreateRequest
from app.schemas.websocket import WebSocketServerMessage
from app.services.queue_service import QueueService, get_queue_service
from app.services.supabase_service import SupabaseService, get_supabase_service
from app.services.websocket_manager import ConnectionManager, get_connection_manager

router = APIRouter(prefix="/queue", tags=["Queue"])


async def _broadcast_unit_updates(
    *,
    unit_id: str,
    queue_service: QueueService,
    connection_manager: ConnectionManager,
) -> None:
    queue_snapshot = queue_service.get_queue_snapshot(unit_id)
    await connection_manager.broadcast(
        channel="queue",
        resource_id=unit_id,
        message=WebSocketServerMessage(
            type="queue.snapshot",
            channel="queue",
            resource_id=unit_id,
            data=queue_snapshot.model_dump(),
        ),
    )

    position_tokens = connection_manager.get_subscribed_resource_ids("position")
    for token in position_tokens:
        position_snapshot = queue_service.try_get_position_snapshot(token)
        if position_snapshot is None or position_snapshot.unit_id != unit_id:
            continue

        await connection_manager.broadcast(
            channel="position",
            resource_id=token,
            message=WebSocketServerMessage(
                type="position.snapshot",
                channel="position",
                resource_id=token,
                data=position_snapshot.model_dump(),
            ),
        )


def _persist_entry_created(
    *,
    supabase_service: SupabaseService,
    result_data: dict,
) -> None:
    entry = result_data["entry"]
    position = result_data["position"]

    supabase_service.save_queue_entry(
        {
            "unit_id": entry["unit_id"],
            "ticket": entry["ticket"],
            "person_name": entry["person_name"],
            "priority": entry["priority"],
            "category": entry["category"],
            "status": entry["status"],
            "qr_token": entry["position_token"],
            "created_at": entry["created_at"],
            "called_at": entry["called_at"],
            "finished_at": entry["finished_at"],
        }
    )
    supabase_service.save_qr_link(
        {
            "qr_token": position["token"],
            "unit_id": position["unit_id"],
            "ticket": position["ticket"],
            "position_path": position["position_path"],
        }
    )
    supabase_service.save_queue_event(
        {
            "unit_id": entry["unit_id"],
            "event_type": "queue.entry_created",
            "ticket": entry["ticket"],
            "qr_token": entry["position_token"],
            "payload": result_data,
        }
    )


def _persist_entry_updated(
    *,
    event_type: str,
    supabase_service: SupabaseService,
    result_data: dict,
) -> None:
    entry = result_data["entry"]

    supabase_service.update_queue_entry(
        entry["position_token"],
        {
            "status": entry["status"],
            "called_at": entry["called_at"],
            "finished_at": entry["finished_at"],
        },
    )
    supabase_service.save_queue_event(
        {
            "unit_id": entry["unit_id"],
            "event_type": event_type,
            "ticket": entry["ticket"],
            "qr_token": entry["position_token"],
            "payload": result_data,
        }
    )


@router.get(
    "/{unit_id}",
    response_model=APIResponse,
    summary="Consultar snapshot atual da fila",
)
async def get_queue_snapshot(
    unit_id: str,
    queue_service: QueueService = Depends(get_queue_service),
) -> APIResponse:
    snapshot = queue_service.get_queue_snapshot(unit_id)
    return APIResponse(
        message="Snapshot da fila obtido com sucesso.",
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
    queue_service: QueueService = Depends(get_queue_service),
    supabase_service: SupabaseService = Depends(get_supabase_service),
    connection_manager: ConnectionManager = Depends(get_connection_manager),
) -> APIResponse:
    result = queue_service.create_entry(payload)
    result_data = result.model_dump()

    _persist_entry_created(supabase_service=supabase_service, result_data=result_data)
    await _broadcast_unit_updates(
        unit_id=payload.unit_id,
        queue_service=queue_service,
        connection_manager=connection_manager,
    )

    return APIResponse(
        message="Pessoa adicionada à fila com sucesso.",
        data=result_data,
    )


@router.post(
    "/call-next",
    response_model=APIResponse,
    summary="Chamar a próxima senha da fila",
)
async def call_next_entry(
    payload: QueueActionRequest,
    queue_service: QueueService = Depends(get_queue_service),
    supabase_service: SupabaseService = Depends(get_supabase_service),
    connection_manager: ConnectionManager = Depends(get_connection_manager),
) -> APIResponse:
    result = queue_service.call_next(payload)
    result_data = result.model_dump()

    _persist_entry_updated(
        event_type="queue.entry_called",
        supabase_service=supabase_service,
        result_data=result_data,
    )
    await _broadcast_unit_updates(
        unit_id=payload.unit_id,
        queue_service=queue_service,
        connection_manager=connection_manager,
    )

    return APIResponse(
        message="Próxima senha chamada com sucesso.",
        data=result_data,
    )


@router.post(
    "/finish-current",
    response_model=APIResponse,
    summary="Finalizar atendimento atual",
)
async def finish_current_entry(
    payload: QueueActionRequest,
    queue_service: QueueService = Depends(get_queue_service),
    supabase_service: SupabaseService = Depends(get_supabase_service),
    connection_manager: ConnectionManager = Depends(get_connection_manager),
) -> APIResponse:
    result = queue_service.finish_current(payload)
    result_data = result.model_dump()

    _persist_entry_updated(
        event_type="queue.entry_finished",
        supabase_service=supabase_service,
        result_data=result_data,
    )
    await _broadcast_unit_updates(
        unit_id=payload.unit_id,
        queue_service=queue_service,
        connection_manager=connection_manager,
    )

    return APIResponse(
        message="Atendimento atual finalizado com sucesso.",
        data=result_data,
    )
