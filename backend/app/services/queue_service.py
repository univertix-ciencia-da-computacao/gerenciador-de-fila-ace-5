from fastapi import Depends

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
        raise FeatureNotImplementedError(
            "A criação de entradas da fila será implementada futuramente "
        )

    def call_next(self, payload: QueueActionRequest) -> QueueActionResult:
        raise FeatureNotImplementedError(
            "A chamada da próxima senha será implementada futuramente "
        )

    def finish_current(self, payload: QueueActionRequest) -> QueueActionResult:
        raise FeatureNotImplementedError(
            "A finalização do atendimento atual será implementada futuramente "
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
