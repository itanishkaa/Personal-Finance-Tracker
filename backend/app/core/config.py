from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application configuration, loaded from environment variables
    (or a .env file in local development).
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "sqlite:///./finance.db"

    # Auth
    secret_key: str = "change-this-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 1 day

    # AI
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"

    # CORS - comma separated list of allowed origins
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
