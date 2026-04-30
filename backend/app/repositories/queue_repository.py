from functools import lru_cache
from typing import Any
from datetime import datetime

from fastapi import Depends

from app.core.exceptions import ExternalServiceError
from app.services.supabase_service import SupabaseService, get_supabase_service


class QueueRepository:
    def __init__(self, supabase_service: SupabaseService) -> None:
        self.supabase_service = supabase_service
        self.settings = supabase_service.settings

    def create_queue_entry(self, record: dict[str, Any]) -> dict[str, Any]:
        return self._insert_record(
            table=self.settings.supabase_queue_entries_table,
            record=record,
            error_message="Falha ao persistir entrada da fila no Supabase.",
        )

    def update_queue_entry(
        self,
        qr_token: str,
        record: dict[str, Any],
    ) -> dict[str, Any]:
        try:
            response = (
                self.supabase_service.get_client()
                .table(self.settings.supabase_queue_entries_table)
                .update(record)
                .eq("qr_token", qr_token)
                .execute()
            )
        except Exception as exc:
            raise ExternalServiceError(
                "Falha ao atualizar entrada da fila no Supabase."
            ) from exc

        if not getattr(response, "data", None):
            raise ExternalServiceError(
                "Nenhuma entrada da fila foi atualizada no Supabase."
            )

        return response.data[0]

    def create_queue_event(self, record: dict[str, Any]) -> dict[str, Any]:
        return self._insert_record(
            table=self.settings.supabase_queue_events_table,
            record=record,
            error_message="Falha ao persistir evento da fila no Supabase.",
        )

    def create_qr_link(self, record: dict[str, Any]) -> dict[str, Any]:
        return self._insert_record(
            table=self.settings.supabase_qr_links_table,
            record=record,
            error_message="Falha ao persistir link de QR no Supabase.",
        )

    def fetch_queue_entry_by_token(self, token: str) -> dict[str, Any] | None:
        try:
            response = (
                self.supabase_service.get_client()
                .table(self.settings.supabase_queue_entries_table)
                .select("*")
                .eq("qr_token", token)
                .limit(1)
                .execute()
            )
        except Exception as exc:
            raise ExternalServiceError(
                "Falha ao consultar entrada da fila no Supabase."
            ) from exc

        if not getattr(response, "data", None):
            return None
        return response.data[0]

    def fetch_current_called_entry(self, unit_id: str) -> dict[str, Any] | None:
        try:
            response = (
                self.supabase_service.get_client()
                .table(self.settings.supabase_queue_entries_table)
                .select("*")
                .eq("unit_id", unit_id)
                .eq("status", "called")
                .order("called_at", desc=True, nullsfirst=False)
                .limit(1)
                .execute()
            )
        except Exception as exc:
            raise ExternalServiceError(
                "Falha ao consultar atendimento atual no Supabase."
            ) from exc

        if not getattr(response, "data", None):
            return None
        return response.data[0]

    def fetch_last_called_entry(self, unit_id: str) -> dict[str, Any] | None:
        try:
            response = (
                self.supabase_service.get_client()
                .table(self.settings.supabase_queue_entries_table)
                .select("*")
                .eq("unit_id", unit_id)
                .in_("status", ["called", "finished"])
                .order("called_at", desc=True, nullsfirst=False)
                .limit(1)
                .execute()
            )
        except Exception as exc:
            raise ExternalServiceError(
                "Falha ao consultar última senha chamada no Supabase."
            ) from exc

        if not getattr(response, "data", None):
            return None
        return response.data[0]

    def fetch_waiting_entries(self, unit_id: str) -> list[dict[str, Any]]:
        try:
            response = (
                self.supabase_service.get_client()
                .table(self.settings.supabase_queue_entries_table)
                .select("*")
                .eq("unit_id", unit_id)
                .eq("status", "waiting")
                .order("priority", desc=True)
                .order("ticket_sequence")
                .order("created_at")
                .execute()
            )
        except Exception as exc:
            raise ExternalServiceError(
                "Falha ao consultar fila de espera no Supabase."
            ) from exc

        return list(getattr(response, "data", []) or [])

    def fetch_next_waiting_entry(self, unit_id: str) -> dict[str, Any] | None:
        entries = self.fetch_waiting_entries(unit_id)
        return entries[0] if entries else None

    def get_next_ticket_sequence(self, unit_id: str) -> int:
        try:
            response = (
                self.supabase_service.get_client()
                .table(self.settings.supabase_queue_entries_table)
                .select("ticket_sequence")
                .eq("unit_id", unit_id)
                .order("ticket_sequence", desc=True, nullsfirst=False)
                .limit(1)
                .execute()
            )
        except Exception as exc:
            raise ExternalServiceError(
                "Falha ao calcular a próxima senha da fila no Supabase."
            ) from exc

        if not getattr(response, "data", None):
            return 1

        last_sequence = response.data[0].get("ticket_sequence") or 0
        return int(last_sequence) + 1

    def finish_entry(self, entry: dict[str, Any]) -> dict[str, Any]:
        try:
            response = (
                self.supabase_service.get_client()
                .table(self.settings.supabase_queue_entries_table)
                .update(
                    {
                        "status": "finished",
                        "finished_at": datetime.utcnow().isoformat(),
                    }
                )
                .eq("id", entry["id"])
                .execute()
            )
        except Exception as exc:
            raise ExternalServiceError(
                "Falha ao finalizar atendimento no Supabase."
            ) from exc

        if not getattr(response, "data", None):
            raise ExternalServiceError(
                "Nenhuma entrada foi finalizada no Supabase."
            )

        updated_entry = response.data[0]

        self.create_queue_event(
            {
                "unit_id": updated_entry["unit_id"],
                "event_type": "finished",
                "ticket": updated_entry["ticket"],
                "qr_token": updated_entry["qr_token"],
                "payload": {"status": "finished"}
            }
        )

        return updated_entry

    def _insert_record(
        self,
        *,
        table: str,
        record: dict[str, Any],
        error_message: str,
    ) -> dict[str, Any]:
        try:
            response = (
                self.supabase_service.get_client()
                .table(table)
                .insert(record)
                .execute()
            )
        except Exception as exc:
            raise ExternalServiceError(error_message) from exc

        if not getattr(response, "data", None):
            raise ExternalServiceError(error_message)

        return response.data[0]


@lru_cache
def get_queue_repository(
    supabase_service: SupabaseService = Depends(get_supabase_service),
) -> QueueRepository:
    return QueueRepository(supabase_service=supabase_service)