import unittest
from types import SimpleNamespace

from fastapi import HTTPException

from app.schemas.queue import QueueActionRequest, QueueEntryCreateRequest
from app.services.queue_service import QueueService


class FakeQueueRepository:
    def __init__(self) -> None:
        self.entries: list[dict] = []
        self.events: list[dict] = []
        self.qr_links: list[dict] = []
        self.next_id = 1

    def get_next_ticket_sequence(self, unit_id: str) -> int:
        unit_entries = [entry for entry in self.entries if entry["unit_id"] == unit_id]
        if not unit_entries:
            return 1
        return max(entry["ticket_sequence"] for entry in unit_entries) + 1

    def create_queue_entry(self, record: dict) -> dict:
        entry = {
            "id": self.next_id,
            "created_at": f"2026-01-01T00:00:0{self.next_id}",
            "called_at": None,
            "finished_at": None,
            **record,
        }
        self.next_id += 1
        self.entries.append(entry)
        return entry

    def create_queue_event(self, record: dict) -> dict:
        self.events.append(record)
        return record

    def create_qr_link(self, record: dict) -> dict:
        self.qr_links.append(record)
        return record

    def fetch_waiting_entries(self, unit_id: str) -> list[dict]:
        waiting_entries = [
            entry
            for entry in self.entries
            if entry["unit_id"] == unit_id and entry["status"] == "waiting"
        ]
        risk_weight = {
            "emergencia": 0,
            "muito_urgente": 1,
            "urgente": 2,
            "pouco_urgente": 3,
            "nao_urgente": 4,
        }
        return sorted(
            waiting_entries,
            key=lambda entry: (
                risk_weight[entry["risk_classification"]],
                entry["ticket_sequence"],
                entry["created_at"],
            ),
        )

    def fetch_next_waiting_entry(self, unit_id: str) -> dict | None:
        waiting_entries = self.fetch_waiting_entries(unit_id)
        return waiting_entries[0] if waiting_entries else None

    def fetch_current_called_entry(self, unit_id: str) -> dict | None:
        called_entries = [
            entry
            for entry in self.entries
            if entry["unit_id"] == unit_id and entry["status"] == "called"
        ]
        return called_entries[-1] if called_entries else None

    def fetch_last_called_entry(self, unit_id: str) -> dict | None:
        called_or_finished = [
            entry
            for entry in self.entries
            if entry["unit_id"] == unit_id and entry["status"] in {"called", "finished"}
        ]
        return called_or_finished[-1] if called_or_finished else None

    def fetch_queue_entry_by_token(self, token: str) -> dict | None:
        for entry in self.entries:
            if entry["qr_token"] == token:
                return entry
        return None

    def call_entry(self, entry: dict) -> dict:
        entry["status"] = "called"
        entry["called_at"] = "2026-01-01T01:00:00"
        return entry

    def finish_entry(self, entry: dict) -> dict:
        entry["status"] = "finished"
        entry["finished_at"] = "2026-01-01T02:00:00"
        return entry


def make_service() -> QueueService:
    return QueueService(
        queue_repository=FakeQueueRepository(),
        settings=SimpleNamespace(api_prefix="/api/v1"),
    )


class QueueServiceRiskClassificationTest(unittest.TestCase):
    def test_create_entry_persists_risk_classification(self) -> None:
        service = make_service()

        result = service.create_entry(
            QueueEntryCreateRequest(
                person_name="Ana Silva",
                unit_id="default",
                priority=False,
                category="triagem",
                risk_classification="urgente",
            )
        )

        self.assertEqual(result.entry.ticket, "001")
        self.assertEqual(result.entry.risk_classification, "urgente")
        self.assertEqual(result.position.risk_classification, "urgente")
        self.assertEqual(result.position.people_ahead, 0)
        self.assertEqual(result.queue.waiting_count, 1)

    def test_call_next_uses_risk_classification_before_arrival_order(self) -> None:
        service = make_service()
        repository = service.queue_repository

        service.create_entry(
            QueueEntryCreateRequest(
                person_name="Paciente normal",
                unit_id="default",
                priority=False,
                category="clinico-geral",
                risk_classification="nao_urgente",
            )
        )
        service.create_entry(
            QueueEntryCreateRequest(
                person_name="Paciente emergencia",
                unit_id="default",
                priority=False,
                category="clinico-geral",
                risk_classification="emergencia",
            )
        )

        result = service.call_next(QueueActionRequest(unit_id="default"))

        self.assertEqual(result.entry.person_name, "Paciente emergencia")
        self.assertEqual(result.entry.risk_classification, "emergencia")
        self.assertEqual(result.queue.current_ticket, result.entry.ticket)
        self.assertEqual(repository.events[-1]["event_type"], "called")

    def test_position_snapshot_counts_people_ahead_by_risk(self) -> None:
        service = make_service()

        first = service.create_entry(
            QueueEntryCreateRequest(
                person_name="Primeira urgencia",
                unit_id="default",
                priority=False,
                category="clinico-geral",
                risk_classification="urgente",
            )
        )
        second = service.create_entry(
            QueueEntryCreateRequest(
                person_name="Segunda urgencia",
                unit_id="default",
                priority=False,
                category="clinico-geral",
                risk_classification="urgente",
            )
        )
        service.create_entry(
            QueueEntryCreateRequest(
                person_name="Emergencia posterior",
                unit_id="default",
                priority=False,
                category="clinico-geral",
                risk_classification="emergencia",
            )
        )

        first_position = service.get_position_snapshot(first.entry.position_token)
        second_position = service.get_position_snapshot(second.entry.position_token)

        self.assertEqual(first_position.position, 2)
        self.assertEqual(first_position.people_ahead, 1)
        self.assertEqual(second_position.position, 3)
        self.assertEqual(second_position.people_ahead, 2)

    def test_call_next_without_waiting_entries_returns_404(self) -> None:
        service = make_service()

        with self.assertRaises(HTTPException) as exc:
            service.call_next(QueueActionRequest(unit_id="default"))

        self.assertEqual(exc.exception.status_code, 404)
        self.assertEqual(exc.exception.detail, "QUEUE_NO_WAITING_ENTRY")


if __name__ == "__main__":
    unittest.main()
