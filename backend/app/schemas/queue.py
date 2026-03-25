from pydantic import BaseModel, Field, field_validator

from app.schemas.position import PositionSnapshotData


class QueueEntryCreateRequest(BaseModel):
    person_name: str = Field(
        ...,
        min_length=2,
        max_length=120,
        description="Nome da pessoa que será adicionada à fila.",
    )
    unit_id: str = Field(
        default="default",
        min_length=1,
        max_length=60,
        description="Identificador da unidade ou fila.",
    )
    priority: bool = Field(
        default=False,
        description="Indica se a pessoa deve ter prioridade no atendimento.",
    )
    category: str | None = Field(
        default=None,
        max_length=60,
        description="Categoria opcional do atendimento.",
    )

    @field_validator("person_name", "unit_id", "category", mode="before")
    @classmethod
    def strip_strings(cls, value: str | None) -> str | None:
        if isinstance(value, str):
            value = value.strip()
        return value


class QueueActionRequest(BaseModel):
    unit_id: str = Field(
        default="default",
        min_length=1,
        max_length=60,
        description="Identificador da unidade ou fila.",
    )

    @field_validator("unit_id", mode="before")
    @classmethod
    def strip_unit_id(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value


class QueueEntryData(BaseModel):
    ticket: str = Field(..., description="Senha gerada para a pessoa na fila.")
    person_name: str = Field(..., description="Nome da pessoa cadastrada.")
    unit_id: str = Field(..., description="Fila/unidade à qual a pessoa pertence.")
    priority: bool = Field(..., description="Indica se a senha é prioritária.")
    category: str | None = Field(
        default=None,
        description="Categoria opcional associada ao atendimento.",
    )
    status: str = Field(..., description="Estado atual da senha na fila.")
    position_token: str = Field(
        ..., description="Token único usado para consulta da posição da senha."
    )
    position_path: str = Field(
        ..., description="Caminho HTTP para consulta da posição atual da senha."
    )
    created_at: str = Field(..., description="Data/hora de criação da senha.")
    called_at: str | None = Field(
        default=None,
        description="Data/hora em que a senha foi chamada.",
    )
    finished_at: str | None = Field(
        default=None,
        description="Data/hora em que o atendimento foi finalizado.",
    )


class QueueEntrySummary(BaseModel):
    ticket: str = Field(..., description="Senha exibida na fila.")
    person_name: str = Field(..., description="Nome da pessoa exibida na fila.")
    priority: bool = Field(..., description="Indica se a senha é prioritária.")
    category: str | None = Field(
        default=None,
        description="Categoria opcional do atendimento.",
    )
    status: str = Field(..., description="Estado atual da senha.")


class CurrentQueueEntryData(QueueEntrySummary):
    called_at: str | None = Field(
        default=None,
        description="Momento da chamada da senha em atendimento.",
    )


class QueueSnapshotData(BaseModel):
    unit_id: str = Field(..., description="Identificador da fila/unidade.")
    current_ticket: str | None = Field(
        default=None,
        description="Senha atualmente em atendimento, quando existir.",
    )
    current_entry: CurrentQueueEntryData | None = Field(
        default=None,
        description="Dados da senha atual em atendimento.",
    )
    last_called: str | None = Field(
        default=None,
        description="Última senha chamada na fila.",
    )
    waiting_count: int = Field(..., description="Quantidade de pessoas aguardando.")
    queue: list[QueueEntrySummary] = Field(
        default_factory=list,
        description="Lista ordenada das pessoas ainda aguardando atendimento.",
    )


class QueueEntryCreatedResult(BaseModel):
    entry: QueueEntryData
    position: PositionSnapshotData
    queue: QueueSnapshotData


class QueueActionResult(BaseModel):
    entry: QueueEntryData
    queue: QueueSnapshotData
