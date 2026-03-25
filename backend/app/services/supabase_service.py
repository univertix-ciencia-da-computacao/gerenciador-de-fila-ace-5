from functools import lru_cache

from app.core.config import Settings, get_settings
from app.core.exceptions import ConfigurationError, ExternalServiceError
from supabase import Client, create_client


class SupabaseService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client: Client | None = None

    @property
    def is_configured(self) -> bool:
        return self.settings.supabase_enabled

    def get_client(self) -> Client:
        if not self.is_configured:
            raise ConfigurationError(
                "SUPABASE_URL e SUPABASE_KEY são obrigatórios para operar a fila."
            )

        if self._client is None:
            try:
                self._client = create_client(
                    self.settings.supabase_url or "",
                    self.settings.supabase_key or "",
                )
            except Exception as exc:
                raise ExternalServiceError(
                    "Não foi possível inicializar o cliente do Supabase."
                ) from exc
        return self._client


@lru_cache
def get_supabase_service() -> SupabaseService:
    return SupabaseService(get_settings())
