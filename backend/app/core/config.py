from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Fila ACE"
    app_version: str = "0.1.0"
    api_prefix: str = "/api/v1"

    app_host: str = "0.0.0.0"
    port: int = 8000

    supabase_url: str | None = None
    supabase_key: str | None = None
    supabase_queue_entries_table: str = "queue_entries"
    supabase_queue_events_table: str = "queue_events"
    supabase_qr_links_table: str = "qr_links"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def supabase_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
