import logging

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.core.config import Settings, get_settings
from app.schemas.websocket import WebSocketClientMessage, WebSocketServerMessage
from app.services.queue_service import QueueService, get_queue_service
from app.services.websocket_manager import ConnectionManager, get_connection_manager

logger = logging.getLogger(__name__)
router = APIRouter(tags=["WebSocket"])


async def _send_error(
    websocket: WebSocket,
    connection_manager: ConnectionManager,
    *,
    code: str,
    message: str,
    resource_id: str | None = None,
) -> None:
    await connection_manager.send(
        websocket,
        WebSocketServerMessage(
            type="error",
            channel="system",
            resource_id=resource_id,
            data={
                "code": code,
                "message": message,
            },
        ),
    )


async def _send_queue_snapshot(
    *,
    websocket: WebSocket,
    unit_id: str,
    queue_service: QueueService,
    connection_manager: ConnectionManager,
) -> None:
    snapshot = queue_service.get_queue_snapshot(unit_id)
    await connection_manager.send(
        websocket,
        WebSocketServerMessage(
            type="queue.snapshot",
            channel="queue",
            resource_id=unit_id,
            data=snapshot.model_dump(),
        ),
    )


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    settings: Settings = Depends(get_settings),
    queue_service: QueueService = Depends(get_queue_service),
    connection_manager: ConnectionManager = Depends(get_connection_manager),
) -> None:
    client_id = await connection_manager.connect(websocket)

    if not settings.supabase_enabled:
        await _send_error(
            websocket,
            connection_manager,
            code="CONFIGURATION_ERROR",
            message="SUPABASE_URL e SUPABASE_KEY são obrigatórios para operar a fila.",
        )
        await websocket.close(code=1013, reason="Supabase não configurado")
        connection_manager.disconnect(websocket)
        return

    await connection_manager.send(
        websocket,
        WebSocketServerMessage(
            type="connected",
            data={"client_id": client_id},
        ),
    )

    try:
        while True:
            try:
                raw_message = await websocket.receive_json()
            except ValueError:
                await _send_error(
                    websocket,
                    connection_manager,
                    code="INVALID_JSON",
                    message="A mensagem recebida não é um JSON válido.",
                )
                continue

            try:
                client_message = WebSocketClientMessage.model_validate(raw_message)
            except ValidationError as exc:
                await _send_error(
                    websocket,
                    connection_manager,
                    code="INVALID_MESSAGE",
                    message="Mensagem WebSocket inválida.",
                )
                await connection_manager.send(
                    websocket,
                    WebSocketServerMessage(
                        type="validation.details",
                        data={"errors": exc.errors(include_url=False)},
                    ),
                )
                continue

            if client_message.type == "ping":
                await connection_manager.send(
                    websocket,
                    WebSocketServerMessage(type="pong", data={}),
                )
                continue

            channel = client_message.channel or "queue"
            resource_id = client_message.resource_id or (
                "default" if channel == "queue" else None
            )

            if resource_id is None:
                await _send_error(
                    websocket,
                    connection_manager,
                    code="RESOURCE_ID_REQUIRED",
                    message="resource_id é obrigatório para o canal position.",
                )
                continue

            if client_message.type == "subscribe":
                if channel == "position":
                    await _send_error(
                        websocket,
                        connection_manager,
                        code="NOT_IMPLEMENTED",
                        message=(
                            "O canal de posição está previsto, mas será "
                            "implementado."
                        ),
                        resource_id=resource_id,
                    )
                    continue

                connection_manager.subscribe(websocket, channel, resource_id)
                await connection_manager.send(
                    websocket,
                    WebSocketServerMessage(
                        type="subscribed",
                        channel=channel,
                        resource_id=resource_id,
                        data={"ok": True},
                    ),
                )
                await _send_queue_snapshot(
                    websocket=websocket,
                    unit_id=resource_id,
                    queue_service=queue_service,
                    connection_manager=connection_manager,
                )
                continue

            connection_manager.unsubscribe(websocket, channel, resource_id)
            await connection_manager.send(
                websocket,
                WebSocketServerMessage(
                    type="unsubscribed",
                    channel=channel,
                    resource_id=resource_id,
                    data={"ok": True},
                ),
            )
    except WebSocketDisconnect:
        logger.info("Cliente desconectado do WebSocket principal.")
    finally:
        connection_manager.disconnect(websocket)
