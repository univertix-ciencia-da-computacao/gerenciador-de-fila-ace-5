import time
import unittest
from types import SimpleNamespace

import jwt
from fastapi.security import HTTPAuthorizationCredentials

from app.core.dependencies import require_staff
from app.core.exceptions import AuthenticationError
from app.core.security import decode_supabase_token

SECRET = "test-secret-value-at-least-32-bytes-long"


def make_token(**overrides: object) -> str:
    payload: dict[str, object] = {
        "sub": "user-123",
        "email": "staff@example.com",
        "aud": "authenticated",
        "exp": int(time.time()) + 3600,
    }
    payload.update(overrides)
    return jwt.encode(payload, SECRET, algorithm="HS256")


class DecodeSupabaseTokenTest(unittest.TestCase):
    def test_valid_token_returns_claims(self) -> None:
        claims = decode_supabase_token(make_token(), SECRET)
        self.assertEqual(claims["email"], "staff@example.com")
        self.assertEqual(claims["sub"], "user-123")

    def test_wrong_secret_raises(self) -> None:
        with self.assertRaises(AuthenticationError):
            decode_supabase_token(make_token(), "outro-segredo-value-at-least-32-bytes")

    def test_expired_token_raises(self) -> None:
        token = make_token(exp=int(time.time()) - 10)
        with self.assertRaises(AuthenticationError):
            decode_supabase_token(token, SECRET)


def _settings() -> object:
    return SimpleNamespace(supabase_jwt_secret=SECRET)


class RequireStaffTest(unittest.TestCase):
    def test_valid_bearer_returns_staff_user(self) -> None:
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=make_token())
        user = require_staff(credentials=creds, settings=_settings())
        self.assertEqual(user.email, "staff@example.com")
        self.assertEqual(user.id, "user-123")

    def test_missing_credentials_raises(self) -> None:
        with self.assertRaises(AuthenticationError):
            require_staff(credentials=None, settings=_settings())

    def test_invalid_token_raises(self) -> None:
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="garbage")
        with self.assertRaises(AuthenticationError):
            require_staff(credentials=creds, settings=_settings())


if __name__ == "__main__":
    unittest.main()
