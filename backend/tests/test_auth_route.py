import unittest
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.main import app
from app.services.supabase_service import get_supabase_service


class FakeAuth:
    def sign_in_with_password(self, credentials: dict) -> object:
        if credentials["password"] != "correct":
            raise ValueError("invalid login credentials")
        return SimpleNamespace(
            session=SimpleNamespace(access_token="signed-jwt"),
            user=SimpleNamespace(id="user-123", email=credentials["email"]),
        )


class FakeClient:
    auth = FakeAuth()


class FakeSupabaseService:
    def get_client(self) -> FakeClient:
        return FakeClient()


class AuthRouteTest(unittest.TestCase):
    def setUp(self) -> None:
        app.dependency_overrides[get_supabase_service] = lambda: FakeSupabaseService()
        self.client = TestClient(app)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    def test_login_success_returns_token(self) -> None:
        resp = self.client.post(
            "/api/v1/auth/login",
            json={"email": "staff@example.com", "password": "correct"},
        )
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["data"]["access_token"], "signed-jwt")
        self.assertEqual(body["data"]["user"]["email"], "staff@example.com")

    def test_login_bad_password_returns_401(self) -> None:
        resp = self.client.post(
            "/api/v1/auth/login",
            json={"email": "staff@example.com", "password": "wrong"},
        )
        self.assertEqual(resp.status_code, 401)


if __name__ == "__main__":
    unittest.main()
