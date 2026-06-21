from functools import lru_cache
from typing import Any

import jwt
from jwt import PyJWKClient

from app.core.exceptions import AuthenticationError

SUPABASE_AUDIENCE = "authenticated"
_ASYMMETRIC_ALGORITHMS = {"ES256", "RS256"}


@lru_cache(maxsize=8)
def _get_jwks_client(jwks_url: str) -> PyJWKClient:
    """Cache one JWKS client per URL so signing keys are fetched and reused."""
    return PyJWKClient(jwks_url)


def decode_supabase_token(
    token: str,
    secret: str | None = None,
    *,
    jwks_url: str | None = None,
) -> dict[str, Any]:
    """Verifica localmente a assinatura de um JWT emitido pelo Supabase Auth.

    Suporta os dois modos de assinatura do Supabase:
    - HS256: segredo compartilhado (`secret`), modelo legado.
    - ES256/RS256: chaves assimétricas verificadas via JWKS (`jwks_url`).

    Levanta AuthenticationError para qualquer token inválido, expirado, com
    audiência incorreta, algoritmo não suportado ou sem material de chave.
    """
    try:
        algorithm = jwt.get_unverified_header(token).get("alg")

        if algorithm == "HS256":
            if not secret:
                raise AuthenticationError()
            key: Any = secret
            algorithms = ["HS256"]
        elif algorithm in _ASYMMETRIC_ALGORITHMS:
            if not jwks_url:
                raise AuthenticationError()
            key = _get_jwks_client(jwks_url).get_signing_key_from_jwt(token).key
            algorithms = [algorithm]
        else:
            raise AuthenticationError()

        return jwt.decode(
            token,
            key,
            algorithms=algorithms,
            audience=SUPABASE_AUDIENCE,
        )
    except AuthenticationError:
        raise
    except jwt.PyJWTError as exc:
        raise AuthenticationError() from exc
