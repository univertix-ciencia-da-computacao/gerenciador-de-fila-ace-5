from pydantic import BaseModel, Field


class PositionSnapshotData(BaseModel):
    token: str = Field(..., description="Token único associado à senha.")
    unit_id: str = Field(..., description="Fila/unidade da senha.")
    ticket: str = Field(..., description="Senha gerada para atendimento.")
    status: str = Field(..., description="Estado atual da senha na fila.")
    position: int | None = Field(
        default=None,
        description="Posição atual na fila; fica nula quando o atendimento já terminou.",
    )
    people_ahead: int | None = Field(
        default=None,
        description="Quantidade de pessoas aguardando na frente desta senha.",
    )
    current_ticket: str | None = Field(
        default=None,
        description="Senha atualmente em atendimento, quando existir.",
    )
    position_path: str = Field(
        ..., description="Caminho HTTP para consultar a posição atual."
    )
