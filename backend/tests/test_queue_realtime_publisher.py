import unittest

from app.schemas.position import PositionSnapshotData
from app.schemas.queue import QueueSnapshotData
from app.services.queue_realtime_publisher import QueueRealtimePublisher


class FakeConnectionManager:
    def __init__(self) -> None:
        self.broadcasts: list[dict] = []
        self.position_tokens = {"token-a", "token-b", "token-other"}

    def get_subscribed_resource_ids(self, channel: str) -> set[str]:
        if channel == "position":
            return self.position_tokens
        return set()

    async def broadcast(self, **kwargs) -> None:
        self.broadcasts.append(kwargs)


class FakeQueueService:
    def get_queue_snapshot(self, unit_id: str) -> QueueSnapshotData:
        return QueueSnapshotData(
            unit_id=unit_id,
            current_ticket="001",
            current_entry=None,
            last_called="001",
            waiting_count=1,
            queue=[],
        )

    def try_get_position_snapshot(self, token: str) -> PositionSnapshotData | None:
        unit_id = "default" if token in {"token-a", "token-b"} else "other"
        return PositionSnapshotData(
            token=token,
            unit_id=unit_id,
            ticket="001",
            status="waiting",
            position=1,
            people_ahead=0,
            current_ticket=None,
            position_path=f"/api/v1/position/{token}",
        )


class QueueRealtimePublisherTest(unittest.IsolatedAsyncioTestCase):
    async def test_publish_queue_update_broadcasts_snapshots(self) -> None:
        connection_manager = FakeConnectionManager()
        publisher = QueueRealtimePublisher(connection_manager)

        await publisher.publish_queue_update(
            unit_id="default",
            queue_service=FakeQueueService(),
        )

        queue_broadcasts = [
            item for item in connection_manager.broadcasts if item["channel"] == "queue"
        ]
        position_broadcasts = [
            item
            for item in connection_manager.broadcasts
            if item["channel"] == "position"
        ]

        self.assertEqual(len(queue_broadcasts), 1)
        self.assertEqual(queue_broadcasts[0]["resource_id"], "default")
        self.assertEqual(queue_broadcasts[0]["message"].type, "queue.snapshot")
        self.assertEqual(len(position_broadcasts), 2)
        self.assertEqual(
            {item["resource_id"] for item in position_broadcasts},
            {"token-a", "token-b"},
        )
        self.assertTrue(
            all(
                item["message"].type == "position.snapshot"
                for item in position_broadcasts
            )
        )


if __name__ == "__main__":
    unittest.main()
