from uuid import uuid4

from fastapi import Depends, HTTPException

from app.core.config import Settings, get_settings
from app.repositories.queue_repository import QueueRepository, get_queue_repository
from app.schemas.position import PositionSnapshotData
from app.schemas.queue import (
    CurrentQueueEntryData,
    QueueActionRequest,
    QueueActionResult,
    QueueEntryCreatedResult,
    QueueEntryCreateRequest,
    QueueEntrySummary,
    QueueSnapshotData,
)

RISK_CLASSIFICATION_WEIGHT = {
    "emergencia": 0,
    "muito_urgente": 1,
    "urgente": 2,
    "pouco_urgente": 3,
    "nao_urgente": 4,
}

PRIORITY_RISK_CLASSIFICATIONS = {
    "emergencia",
    "muito_urgente",
    "urgente",
}


class QueueService:
    def __init__(self, queue_repository: QueueRepository, settings: Settings) -> None:
        self.queue_repository = queue_repository
        self.api_prefix = settings.api_prefix

    def create_entry(self, payload: QueueEntryCreateRequest) -> QueueEntryCreatedResult:
        unit_id = payload.unit_id
        ticket_sequence = self.queue_repository.get_next_ticket_sequence(unit_id)
        ticket = f"{ticket_sequence:03d}"
        qr_token = uuid4().hex
        position_path = f"{self.api_prefix}/position/{qr_token}"
        risk_classification = payload.risk_classification

        entry = self.queue_repository.create_queue_entry(
            {
                "unit_id": unit_id,
                "ticket_sequence": ticket_sequence,
                "ticket": ticket,
                "person_name": payload.person_name,
                "priority": risk_classification in PRIORITY_RISK_CLASSIFICATIONS,
                "category": payload.category,
                "risk_classification": risk_classification,
                "status": "waiting",
                "qr_token": qr_token,
            }
        )
        self.queue_repository.create_qr_link(
            {
                "qr_token": qr_token,
                "unit_id": unit_id,
                "ticket": ticket,
                "position_path": position_path,
            }
        )
        self.queue_repository.create_queue_event(
            {
                "unit_id": unit_id,
                "event_type": "created",
                "ticket": ticket,
                "qr_token": qr_token,
                "payload": {
                    "risk_classification": risk_classification,
                    "status": "waiting",
                },
            }
        )

        return QueueEntryCreatedResult(
            entry=self._build_entry_data(entry),
            position=self._build_position_snapshot(entry),
            queue=self.get_queue_snapshot(unit_id),
        )

    def call_next(self, payload: QueueActionRequest) -> QueueActionResult:
        entry = self.queue_repository.fetch_next_waiting_entry(payload.unit_id)

        if not entry:
            raise HTTPException(
                status_code=404,
                detail="QUEUE_NO_WAITING_ENTRY",
            )

        called_entry = self.queue_repository.call_entry(entry)
        self.queue_repository.create_queue_event(
            {
                "unit_id": called_entry["unit_id"],
                "event_type": "called",
                "ticket": called_entry["ticket"],
                "qr_token": called_entry["qr_token"],
                "payload": {
                    "risk_classification": called_entry.get(
                        "risk_classification",
                        "nao_urgente",
                    ),
                    "status": "called",
                },
            }
        )

        return QueueActionResult(
            entry=self._build_entry_data(called_entry),
            queue=self.get_queue_snapshot(payload.unit_id),
        )

    def finish_current(self, payload: QueueActionRequest) -> QueueActionResult:
        unit_id = payload.unit_id

        current_entry = self.queue_repository.fetch_current_called_entry(unit_id)

        if not current_entry:
            raise HTTPException(
                status_code=404,
                detail="QUEUE_NO_CURRENT_ENTRY",
            )

        finished_entry = self.queue_repository.finish_entry(current_entry)

        snapshot = self.get_queue_snapshot(unit_id)

        return QueueActionResult(
            entry=self._build_entry_data(finished_entry),
            queue=snapshot,
        )

    def get_queue_snapshot(self, unit_id: str) -> QueueSnapshotData:
        waiting_entries = self._sort_waiting_entries(
            self.queue_repository.fetch_waiting_entries(unit_id)
        )
        current_entry = self.queue_repository.fetch_current_called_entry(unit_id)
        last_called_entry = self.queue_repository.fetch_last_called_entry(unit_id)

        return QueueSnapshotData(
            unit_id=unit_id,
            current_ticket=current_entry["ticket"] if current_entry else None,
            current_entry=self._build_current_entry_data(current_entry)
            if current_entry
            else None,
            last_called=last_called_entry["ticket"] if last_called_entry else None,
            waiting_count=len(waiting_entries),
            queue=[self._build_entry_summary(entry) for entry in waiting_entries],
        )

    def get_position_snapshot(self, token: str) -> PositionSnapshotData:
        entry = self.queue_repository.fetch_queue_entry_by_token(token)

        if not entry:
            raise HTTPException(
                status_code=404,
                detail="POSITION_NOT_FOUND",
            )

        return self._build_position_snapshot(entry)

    def try_get_position_snapshot(self, token: str) -> PositionSnapshotData | None:
        entry = self.queue_repository.fetch_queue_entry_by_token(token)

        if not entry:
            return None

        return self._build_position_snapshot(entry)

    def _build_entry_data(self, entry: dict) -> dict:
        return {
            "unit_id": entry["unit_id"],
            "ticket": entry["ticket"],
            "person_name": entry["person_name"],
            "priority": entry["priority"],
            "category": entry.get("category"),
            "risk_classification": entry.get("risk_classification", "nao_urgente"),
            "status": entry["status"],
            "position_token": entry["qr_token"],
            "position_path": f"{self.api_prefix}/position/{entry['qr_token']}",
            "created_at": entry["created_at"],
            "called_at": entry.get("called_at"),
            "finished_at": entry.get("finished_at"),
        }

    def _build_position_snapshot(self, entry: dict) -> PositionSnapshotData:
        waiting_entries = self._sort_waiting_entries(
            self.queue_repository.fetch_waiting_entries(entry["unit_id"])
        )
        waiting_tokens = [
            waiting_entry["qr_token"] for waiting_entry in waiting_entries
        ]
        current_entry = self.queue_repository.fetch_current_called_entry(
            entry["unit_id"]
        )

        if entry["status"] == "waiting" and entry["qr_token"] in waiting_tokens:
            position = waiting_tokens.index(entry["qr_token"]) + 1
            people_ahead = position - 1
        else:
            position = None
            people_ahead = None

        return PositionSnapshotData(
            token=entry["qr_token"],
            unit_id=entry["unit_id"],
            ticket=entry["ticket"],
            person_name=entry.get("person_name"),
            category=entry.get("category"),
            risk_classification=entry.get("risk_classification", "nao_urgente"),
            status=entry["status"],
            position=position,
            people_ahead=people_ahead,
            current_ticket=current_entry["ticket"] if current_entry else None,
            position_path=f"{self.api_prefix}/position/{entry['qr_token']}",
        )

    @staticmethod
    def _sort_waiting_entries(entries: list[dict]) -> list[dict]:
        return sorted(
            entries,
            key=lambda entry: (
                RISK_CLASSIFICATION_WEIGHT.get(
                    entry.get("risk_classification", "nao_urgente"),
                    RISK_CLASSIFICATION_WEIGHT["nao_urgente"],
                ),
                entry["ticket_sequence"],
                entry["created_at"],
            ),
        )

    @staticmethod
    def _build_entry_summary(entry: dict) -> QueueEntrySummary:
        return QueueEntrySummary(
            ticket=entry["ticket"],
            person_name=entry["person_name"],
            priority=entry["priority"],
            category=entry.get("category"),
            risk_classification=entry.get("risk_classification", "nao_urgente"),
            status=entry["status"],
        )

    @staticmethod
    def _build_current_entry_data(entry: dict) -> CurrentQueueEntryData:
        return CurrentQueueEntryData(
            ticket=entry["ticket"],
            person_name=entry["person_name"],
            priority=entry["priority"],
            category=entry.get("category"),
            risk_classification=entry.get("risk_classification", "nao_urgente"),
            status=entry["status"],
            called_at=entry.get("called_at"),
        )


def get_queue_service(
    queue_repository: QueueRepository = Depends(get_queue_repository),
    settings: Settings = Depends(get_settings),
) -> QueueService:
    return QueueService(queue_repository=queue_repository, settings=settings)
