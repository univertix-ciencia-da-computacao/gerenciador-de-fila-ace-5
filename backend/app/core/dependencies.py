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
    jwks_url = getattr(settings, "supabase_jwks_url", None)
    if not settings.supabase_jwt_secret and not jwks_url:
        raise ConfigurationError(
            "SUPABASE_JWT_SECRET ou SUPABASE_URL é obrigatório para autenticar operadores."
        )
    if credentials is None or not credentials.credentials:
        raise AuthenticationError("Token de autenticação ausente.")

    claims = decode_supabase_token(
        credentials.credentials,
        settings.supabase_jwt_secret,
        jwks_url=jwks_url,
    )
    sub = claims.get("sub")
    email = claims.get("email")
    if not sub or not email:
        raise AuthenticationError("Token sem identidade de usuário.")
    return StaffUser(id=str(sub), email=str(email))
