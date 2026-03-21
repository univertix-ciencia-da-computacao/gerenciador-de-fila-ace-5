from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


class WebSocketClientMessage(BaseModel):
    type: Literal["subscribe", "unsubscribe", "ping"] = Field(
        ..., description="Ação enviada pelo cliente WebSocket."
    )
    channel: Literal["queue", "position"] | None = Field(
        default=None,
        description="Canal lógico da assinatura, quando aplicável.",
    )
    resource_id: str | None = Field(
        default=None,
        description="Identificador da fila ou token de posição observado.",
    )

    @model_validator(mode="after")
    def validate_subscription_payload(self) -> "WebSocketClientMessage":
        if self.type in {"subscribe", "unsubscribe"} and not self.channel:
            raise ValueError("channel é obrigatório para subscribe e unsubscribe")
        return self


class WebSocketServerMessage(BaseModel):
    type: str = Field(..., description="Tipo da mensagem enviada pelo servidor.")
    channel: str = Field(
        default="system",
        description="Canal lógico da mensagem de retorno.",
    )
    resource_id: str | None = Field(
        default=None,
        description="Fila ou token relacionado à mensagem.",
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="Momento em que a mensagem foi emitida pelo servidor.",
    )
    data: Any | None = Field(
        default=None,
        description="Conteúdo associado ao tipo da mensagem.",
    )
