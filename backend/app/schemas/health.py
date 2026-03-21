from pydantic import BaseModel, Field


class HealthData(BaseModel):
    status: str = Field(..., description="Status geral da aplicação.")
    app_name: str = Field(..., description="Nome configurado da aplicação.")
    version: str = Field(..., description="Versão atual da API.")
    supabase_configured: bool = Field(
        ..., description="Indica se as credenciais do Supabase foram configuradas."
    )
