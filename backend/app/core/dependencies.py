from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings
from app.core.exceptions import AuthenticationError, ConfigurationError
from app.core.security import decode_supabase_token
from app.schemas.auth import StaffUser

_bearer_scheme = HTTPBearer(auto_error=False)


def require_supabase_configured(
    settings: Settings = Depends(get_settings),
) -> None:
    if not settings.supabase_enabled:
        raise ConfigurationError(
            "SUPABASE_URL e SUPABASE_KEY são obrigatórios para operar a fila."
        )


def require_staff(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    settings: Settings = Depends(get_settings),
) -> StaffUser:
    if not settings.supabase_jwt_secret:
        raise ConfigurationError(
            "SUPABASE_JWT_SECRET é obrigatório para autenticar operadores."
        )
    if credentials is None or not credentials.credentials:
        raise AuthenticationError("Token de autenticação ausente.")

    claims = decode_supabase_token(credentials.credentials, settings.supabase_jwt_secret)
    return StaffUser(id=str(claims.get("sub", "")), email=str(claims.get("email", "")))
