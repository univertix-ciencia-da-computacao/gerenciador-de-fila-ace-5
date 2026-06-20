from typing import Any

import jwt

from app.core.exceptions import AuthenticationError

SUPABASE_AUDIENCE = "authenticated"


def decode_supabase_token(token: str, secret: str) -> dict[str, Any]:
    """Verifica localmente a assinatura de um JWT emitido pelo Supabase Auth.

    Levanta AuthenticationError para qualquer token inválido, expirado ou
    com audiência incorreta.
    """
    try:
        return jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience=SUPABASE_AUDIENCE,
        )
    except jwt.PyJWTError as exc:
        raise AuthenticationError() from exc
