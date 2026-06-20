import time
import unittest

import jwt

from app.core.exceptions import AuthenticationError
from app.core.security import decode_supabase_token

SECRET = "test-secret"


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
            decode_supabase_token(make_token(), "outro-segredo")

    def test_expired_token_raises(self) -> None:
        token = make_token(exp=int(time.time()) - 10)
        with self.assertRaises(AuthenticationError):
            decode_supabase_token(token, SECRET)


if __name__ == "__main__":
    unittest.main()
