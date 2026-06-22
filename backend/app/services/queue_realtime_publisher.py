from fastapi import Depends

from app.schemas.websocket import WebSocketServerMessage
from app.services.queue_service import QueueService
from app.services.websocket_manager import ConnectionManager, get_connection_manager


class QueueRealtimePublisher:
    def __init__(self, connection_manager: ConnectionManager) -> None:
        self.connection_manager = connection_manager

    async def publish_queue_update(
        self,
        *,
        unit_id: str,
        queue_service: QueueService,
    ) -> None:
        queue_snapshot = queue_service.get_queue_snapshot(unit_id)
        await self.connection_manager.broadcast(
            channel="queue",
            resource_id=unit_id,
            message=WebSocketServerMessage(
                type="queue.snapshot",
                channel="queue",
                resource_id=unit_id,
                data=queue_snapshot.model_dump(),
            ),
        )

        for token in self.connection_manager.get_subscribed_resource_ids("position"):
            position_snapshot = queue_service.try_get_position_snapshot(token)

            if not position_snapshot or position_snapshot.unit_id != unit_id:
                continue

            await self.connection_manager.broadcast(
                channel="position",
                resource_id=token,
                message=WebSocketServerMessage(
                    type="position.snapshot",
                    channel="position",
                    resource_id=token,
                    data=position_snapshot.model_dump(),
                ),
            )


def get_queue_realtime_publisher(
    connection_manager: ConnectionManager = Depends(get_connection_manager),
) -> QueueRealtimePublisher:
    return QueueRealtimePublisher(connection_manager)
