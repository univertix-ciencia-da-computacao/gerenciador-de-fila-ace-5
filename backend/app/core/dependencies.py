from fastapi import Depends

from app.core.config import Settings, get_settings
from app.core.exceptions import ConfigurationError


def require_supabase_configured(
    settings: Settings = Depends(get_settings),
) -> None:
    if not settings.supabase_enabled:
        raise ConfigurationError(
            "SUPABASE_URL e SUPABASE_KEY são obrigatórios para operar a fila."
        )
