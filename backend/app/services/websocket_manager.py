from functools import lru_cache
from uuid import uuid4

from fastapi import WebSocket

from app.schemas.websocket import WebSocketServerMessage


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: set[WebSocket] = set()
        self._subscriptions: dict[WebSocket, set[tuple[str, str]]] = {}
        self._client_ids: dict[WebSocket, str] = {}

    @property
    def connection_count(self) -> int:
        return len(self.active_connections)

    async def connect(self, websocket: WebSocket) -> str:
        await websocket.accept()
        self.active_connections.add(websocket)
        self._subscriptions.setdefault(websocket, set())
        client_id = uuid4().hex
        self._client_ids[websocket] = client_id
        return client_id

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.discard(websocket)
        self._subscriptions.pop(websocket, None)
        self._client_ids.pop(websocket, None)

    def subscribe(self, websocket: WebSocket, channel: str, resource_id: str) -> None:
        self._subscriptions.setdefault(websocket, set()).add((channel, resource_id))

    def unsubscribe(self, websocket: WebSocket, channel: str, resource_id: str) -> None:
        self._subscriptions.setdefault(websocket, set()).discard((channel, resource_id))

    def get_subscribed_resource_ids(self, channel: str) -> set[str]:
        return {
            resource_id
            for subscriptions in self._subscriptions.values()
            for subscription_channel, resource_id in subscriptions
            if subscription_channel == channel
        }

    async def send(self, websocket: WebSocket, message: WebSocketServerMessage) -> None:
        await websocket.send_json(message.model_dump())

    async def broadcast(
        self,
        *,
        channel: str,
        resource_id: str,
        message: WebSocketServerMessage,
    ) -> None:
        disconnected: list[WebSocket] = []

        for connection, subscriptions in list(self._subscriptions.items()):
            if (channel, resource_id) not in subscriptions:
                continue

            try:
                await connection.send_json(message.model_dump())
            except Exception:
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)


@lru_cache
def get_connection_manager() -> ConnectionManager:
    return ConnectionManager()
