import unittest
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.core.dependencies import require_supabase_configured
from app.main import app


def _settings_with_secret() -> object:
    return SimpleNamespace(
        supabase_jwt_secret="test-secret",
        api_prefix="/api/v1",
        supabase_enabled=True,
    )


class QueueAuthBoundaryTest(unittest.TestCase):
    def setUp(self) -> None:
        app.dependency_overrides[require_supabase_configured] = lambda: None
        app.dependency_overrides[get_settings] = _settings_with_secret
        self.client = TestClient(app)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    def test_create_entry_without_token_is_401(self) -> None:
        resp = self.client.post(
            "/api/v1/queue/entries",
            json={"person_name": "Ana Silva", "unit_id": "default"},
        )
        self.assertEqual(resp.status_code, 401)

    def test_call_next_without_token_is_401(self) -> None:
        resp = self.client.post("/api/v1/queue/call-next", json={"unit_id": "default"})
        self.assertEqual(resp.status_code, 401)

    def test_finish_current_without_token_is_401(self) -> None:
        resp = self.client.post("/api/v1/queue/finish-current", json={"unit_id": "default"})
        self.assertEqual(resp.status_code, 401)


if __name__ == "__main__":
    unittest.main()
