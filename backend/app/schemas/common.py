from typing import Any

from pydantic import BaseModel, Field


class APIResponse(BaseModel):
    success: bool = True
    message: str = Field(..., description="Mensagem resumida do resultado da operação.")
    data: dict[str, Any] | None = Field(
        default=None,
        description="Conteúdo complementar retornado pela API.",
    )


class ErrorDetail(BaseModel):
    code: str = Field(..., description="Código interno do erro.")
    message: str = Field(..., description="Mensagem legível do erro.")


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
    details: Any | None = Field(
        default=None,
        description="Detalhes adicionais para depuração ou validação.",
    )
