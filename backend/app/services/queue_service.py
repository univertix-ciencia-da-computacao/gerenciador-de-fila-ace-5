from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from functools import lru_cache
from threading import RLock
from uuid import uuid4

from app.core.config import get_settings
from app.core.exceptions import AppException
from app.schemas.position import PositionSnapshotData
from app.schemas.queue import (
    CurrentQueueEntryData,
    QueueActionRequest,
    QueueActionResult,
    QueueEntryCreateRequest,
    QueueEntryCreatedResult,
    QueueEntryData,
    QueueEntrySummary,
    QueueSnapshotData,
)


@dataclass
class QueueEntryState:
    internal_id: str
    sequence_number: int
    ticket: str
    person_name: str
    unit_id: str
    priority: bool
    category: str | None
    qr_token: str
    status: str
    created_at: str
    called_at: str | None = None
    finished_at: str | None = None


class QueueService:
    def __init__(self) -> None:
        self._lock = RLock()
        self._api_prefix = get_settings().api_prefix
        self._entries_by_unit: dict[str, list[QueueEntryState]] = defaultdict(list)
        self._entries_by_token: dict[str, QueueEntryState] = {}
        self._ticket_sequences: dict[str, int] = defaultdict(int)

    def create_entry(self, payload: QueueEntryCreateRequest) -> QueueEntryCreatedResult:
        with self._lock:
            unit_id = payload.unit_id
            self._ticket_sequences[unit_id] += 1
            sequence_number = self._ticket_sequences[unit_id]
            entry = QueueEntryState(
                internal_id=uuid4().hex,
                sequence_number=sequence_number,
                ticket=f"A{sequence_number:03d}",
                person_name=payload.person_name,
                unit_id=unit_id,
                priority=payload.priority,
                category=payload.category,
                qr_token=uuid4().hex,
                status="waiting",
                created_at=self._now(),
            )
            self._entries_by_unit[unit_id].append(entry)
            self._entries_by_token[entry.qr_token] = entry

            return QueueEntryCreatedResult(
                entry=self._build_entry_data(entry),
                position=self._build_position_snapshot_locked(entry.qr_token),
                queue=self._build_queue_snapshot_locked(unit_id),
            )

    def call_next(self, payload: QueueActionRequest) -> QueueActionResult:
        with self._lock:
            current_entry = self._find_current_called_locked(payload.unit_id)
            if current_entry is not None:
                raise AppException(
                    "Já existe uma senha em atendimento. Finalize o atendimento atual antes de chamar a próxima.",
                    status_code=409,
                    code="QUEUE_CURRENT_IN_PROGRESS",
                )

            next_entry = self._get_next_waiting_locked(payload.unit_id)
            if next_entry is None:
                raise AppException(
                    "Não há pessoas aguardando nesta fila.",
                    status_code=404,
                    code="QUEUE_EMPTY",
                )

            next_entry.status = "called"
            next_entry.called_at = self._now()

            return QueueActionResult(
                entry=self._build_entry_data(next_entry),
                queue=self._build_queue_snapshot_locked(payload.unit_id),
            )

    def finish_current(self, payload: QueueActionRequest) -> QueueActionResult:
        with self._lock:
            current_entry = self._find_current_called_locked(payload.unit_id)
            if current_entry is None:
                raise AppException(
                    "Não existe atendimento em andamento para esta fila.",
                    status_code=404,
                    code="QUEUE_NO_CURRENT_ENTRY",
                )

            current_entry.status = "finished"
            current_entry.finished_at = self._now()

            return QueueActionResult(
                entry=self._build_entry_data(current_entry),
                queue=self._build_queue_snapshot_locked(payload.unit_id),
            )

    def get_queue_snapshot(self, unit_id: str) -> QueueSnapshotData:
        with self._lock:
            return self._build_queue_snapshot_locked(unit_id)

    def get_position_snapshot(self, token: str) -> PositionSnapshotData:
        with self._lock:
            if token not in self._entries_by_token:
                raise AppException(
                    "Token de posição não encontrado.",
                    status_code=404,
                    code="POSITION_NOT_FOUND",
                )
            return self._build_position_snapshot_locked(token)

    def try_get_position_snapshot(self, token: str) -> PositionSnapshotData | None:
        with self._lock:
            if token not in self._entries_by_token:
                return None
            return self._build_position_snapshot_locked(token)

    def _build_queue_snapshot_locked(self, unit_id: str) -> QueueSnapshotData:
        entries = self._entries_by_unit.get(unit_id, [])
        waiting_entries = self._get_waiting_entries_locked(unit_id)
        current_entry = self._find_current_called_locked(unit_id)
        called_entries = [entry for entry in entries if entry.called_at]
        called_entries.sort(key=lambda entry: entry.called_at or "")
        last_called = called_entries[-1].ticket if called_entries else None

        return QueueSnapshotData(
            unit_id=unit_id,
            current_ticket=current_entry.ticket if current_entry else None,
            current_entry=self._build_current_entry_data(current_entry)
            if current_entry
            else None,
            last_called=last_called,
            waiting_count=len(waiting_entries),
            queue=[self._build_entry_summary(entry) for entry in waiting_entries],
        )

    def _build_position_snapshot_locked(self, token: str) -> PositionSnapshotData:
        entry = self._entries_by_token[token]
        waiting_entries = self._get_waiting_entries_locked(entry.unit_id)
        current_entry = self._find_current_called_locked(entry.unit_id)

        position: int | None = None
        people_ahead: int | None = None

        if entry.status == "waiting":
            position = next(
                (
                    index + 1
                    for index, waiting_entry in enumerate(waiting_entries)
                    if waiting_entry.qr_token == token
                ),
                None,
            )
            people_ahead = (position - 1) if position is not None else None
        elif entry.status == "called":
            position = 0
            people_ahead = 0

        return PositionSnapshotData(
            token=entry.qr_token,
            unit_id=entry.unit_id,
            ticket=entry.ticket,
            status=entry.status,
            position=position,
            people_ahead=people_ahead,
            current_ticket=current_entry.ticket if current_entry else None,
            position_path=f"{self._api_prefix}/position/{entry.qr_token}",
        )

    def _build_entry_data(self, entry: QueueEntryState) -> QueueEntryData:
        return QueueEntryData(
            ticket=entry.ticket,
            person_name=entry.person_name,
            unit_id=entry.unit_id,
            priority=entry.priority,
            category=entry.category,
            status=entry.status,
            position_token=entry.qr_token,
            position_path=f"{self._api_prefix}/position/{entry.qr_token}",
            created_at=entry.created_at,
            called_at=entry.called_at,
            finished_at=entry.finished_at,
        )

    def _build_entry_summary(self, entry: QueueEntryState) -> QueueEntrySummary:
        return QueueEntrySummary(
            ticket=entry.ticket,
            person_name=entry.person_name,
            priority=entry.priority,
            category=entry.category,
            status=entry.status,
        )

    def _build_current_entry_data(
        self,
        entry: QueueEntryState,
    ) -> CurrentQueueEntryData:
        return CurrentQueueEntryData(
            ticket=entry.ticket,
            person_name=entry.person_name,
            priority=entry.priority,
            category=entry.category,
            status=entry.status,
            called_at=entry.called_at,
        )

    def _get_waiting_entries_locked(self, unit_id: str) -> list[QueueEntryState]:
        waiting_entries = [
            entry
            for entry in self._entries_by_unit.get(unit_id, [])
            if entry.status == "waiting"
        ]
        waiting_entries.sort(
            key=lambda entry: (0 if entry.priority else 1, entry.sequence_number)
        )
        return waiting_entries

    def _get_next_waiting_locked(self, unit_id: str) -> QueueEntryState | None:
        waiting_entries = self._get_waiting_entries_locked(unit_id)
        return waiting_entries[0] if waiting_entries else None

    def _find_current_called_locked(self, unit_id: str) -> QueueEntryState | None:
        for entry in self._entries_by_unit.get(unit_id, []):
            if entry.status == "called":
                return entry
        return None

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()


@lru_cache
def get_queue_service() -> QueueService:
    return QueueService()
