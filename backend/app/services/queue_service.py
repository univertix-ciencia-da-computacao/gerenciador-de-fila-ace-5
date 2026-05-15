import uuid

from fastapi import Depends, HTTPException

from app.core.config import Settings, get_settings
from app.core.exceptions import FeatureNotImplementedError
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


class QueueService:
    def __init__(self, queue_repository: QueueRepository, settings: Settings) -> None:
        self.queue_repository = queue_repository
        self.api_prefix = settings.api_prefix

    def create_entry(self, payload: QueueEntryCreateRequest) -> QueueEntryCreatedResult:
        unit_id = payload.unit_id

        ticket_sequence = self.queue_repository.get_next_ticket_sequence(unit_id)
        ticket = f"A{ticket_sequence:03d}"
        qr_token = uuid.uuid4().hex

        position_path = f"{self.api_prefix}/position/{qr_token}"

        created_entry = self.queue_repository.create_queue_entry(
            {
                "unit_id": unit_id,
                "ticket_sequence": ticket_sequence,
                "ticket": ticket,
                "person_name": payload.person_name,
                "priority": payload.priority,
                "category": payload.category,
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
                "payload": {"status": "waiting"},
            }
        )

        snapshot = self.get_queue_snapshot(unit_id)

        waiting_entries = self.queue_repository.fetch_waiting_entries(unit_id)
        position_index = next(
            (
                index + 1
                for index, entry in enumerate(waiting_entries)
                if entry["qr_token"] == qr_token
            ),
            len(waiting_entries),
        )
        people_ahead = position_index - 1

        current_entry = self.queue_repository.fetch_current_called_entry(unit_id)

        position_snapshot = PositionSnapshotData(
            token=qr_token,
            unit_id=unit_id,
            ticket=ticket,
            status="waiting",
            position=position_index,
            people_ahead=people_ahead,
            current_ticket=current_entry["ticket"] if current_entry else None,
            position_path=position_path,
        )

        entry_data = {
            "id": created_entry["id"],
            "unit_id": created_entry["unit_id"],
            "ticket_sequence": created_entry["ticket_sequence"],
            "ticket": created_entry["ticket"],
            "person_name": created_entry["person_name"],
            "priority": created_entry["priority"],
            "category": created_entry.get("category"),
            "status": created_entry["status"],
            "position_token": created_entry["qr_token"],
            "position_path": position_path,
            "created_at": created_entry["created_at"],
            "called_at": created_entry.get("called_at"),
            "finished_at": created_entry.get("finished_at"),
        }

        return QueueEntryCreatedResult(
            entry=entry_data,
            position=position_snapshot,
            queue=snapshot,
        )

    def call_next(self, payload: QueueActionRequest) -> QueueActionResult:
        raise FeatureNotImplementedError(
            "A chamada da próxima senha será implementada futuramente "
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

        # Mapeamento 100% fiel ao banco de dados + os campos virtuais exigidos pela API
        entry_data = {
            "id": finished_entry["id"],
            "unit_id": finished_entry["unit_id"],
            "ticket_sequence": finished_entry["ticket_sequence"],
            "ticket": finished_entry["ticket"],
            "person_name": finished_entry["person_name"],
            "priority": finished_entry["priority"],
            "category": finished_entry.get("category"),
            "status": finished_entry["status"],
            "position_token": finished_entry["qr_token"],
            "position_path": f"{self.api_prefix}/queue/{finished_entry['qr_token']}/position",
            "created_at": finished_entry["created_at"],
            "called_at": finished_entry.get("called_at"),
            "finished_at": finished_entry.get("finished_at"),
        }

        return QueueActionResult(
            entry=entry_data,
            queue=snapshot,
        )
    def get_queue_snapshot(self, unit_id: str) -> QueueSnapshotData:
        waiting_entries = self.queue_repository.fetch_waiting_entries(unit_id)
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
        raise FeatureNotImplementedError(
            "A consulta detalhada da posição será implementada futuramente "
        )

    def try_get_position_snapshot(self, token: str) -> PositionSnapshotData | None:
        return None

    @staticmethod
    def _build_entry_summary(entry: dict) -> QueueEntrySummary:
        return QueueEntrySummary(
            ticket=entry["ticket"],
            person_name=entry["person_name"],
            priority=entry["priority"],
            category=entry.get("category"),
            status=entry["status"],
        )

    @staticmethod
    def _build_current_entry_data(entry: dict) -> CurrentQueueEntryData:
        return CurrentQueueEntryData(
            ticket=entry["ticket"],
            person_name=entry["person_name"],
            priority=entry["priority"],
            category=entry.get("category"),
            status=entry["status"],
            called_at=entry.get("called_at"),
        )


def get_queue_service(
    queue_repository: QueueRepository = Depends(get_queue_repository),
    settings: Settings = Depends(get_settings),
) -> QueueService:
    return QueueService(queue_repository=queue_repository, settings=settings)