import logging
from functools import lru_cache
from typing import Any

from supabase import Client, create_client

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)


class SupabaseService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client: Client | None = None

    @property
    def is_configured(self) -> bool:
        return self.settings.supabase_enabled

    def get_client(self) -> Client:
        if self._client is None:
            self._client = create_client(
                self.settings.supabase_url or "",
                self.settings.supabase_key or "",
            )
        return self._client

    def save_queue_entry(self, record: dict[str, Any]) -> dict[str, Any]:
        return self._insert_record(
            table=self.settings.supabase_queue_entries_table,
            record=record,
            error_message="Falha ao persistir entrada da fila no Supabase.",
        )

    def update_queue_entry(self, qr_token: str, record: dict[str, Any]) -> dict[str, Any]:
        table = self.settings.supabase_queue_entries_table
        if not self.is_configured:
            return {
                "persisted": False,
                "table": table,
                "record": record,
                "reason": "Credenciais do Supabase não configuradas no ambiente.",
            }

        try:
            response = (
                self.get_client()
                .table(table)
                .update(record)
                .eq("qr_token", qr_token)
                .execute()
            )
            persisted_record = response.data[0] if getattr(response, "data", None) else record
            return {
                "persisted": True,
                "table": table,
                "record": persisted_record,
                "reason": None,
            }
        except Exception as exc:
            logger.warning("Falha ao atualizar entrada da fila no Supabase: %s", exc)
            return {
                "persisted": False,
                "table": table,
                "record": record,
                "reason": "Falha ao atualizar entrada da fila no Supabase.",
            }

    def save_queue_event(self, record: dict[str, Any]) -> dict[str, Any]:
        return self._insert_record(
            table=self.settings.supabase_queue_events_table,
            record=record,
            error_message="Falha ao persistir evento da fila no Supabase.",
        )

    def save_qr_link(self, record: dict[str, Any]) -> dict[str, Any]:
        return self._insert_record(
            table=self.settings.supabase_qr_links_table,
            record=record,
            error_message="Falha ao persistir link de QR no Supabase.",
        )

    def _insert_record(
        self,
        *,
        table: str,
        record: dict[str, Any],
        error_message: str,
    ) -> dict[str, Any]:
        if not self.is_configured:
            return {
                "persisted": False,
                "table": table,
                "record": record,
                "reason": "Credenciais do Supabase não configuradas no ambiente.",
            }

        try:
            response = self.get_client().table(table).insert(record).execute()
            persisted_record = response.data[0] if getattr(response, "data", None) else record
            return {
                "persisted": True,
                "table": table,
                "record": persisted_record,
                "reason": None,
            }
        except Exception as exc:
            logger.warning("%s Erro: %s", error_message, exc)
            return {
                "persisted": False,
                "table": table,
                "record": record,
                "reason": error_message,
            }


@lru_cache
def get_supabase_service() -> SupabaseService:
    return SupabaseService(get_settings())
