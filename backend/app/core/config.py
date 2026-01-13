from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        env_file_encoding="utf-8",
    )
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # CORS - accept as string and parse
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://localhost:5173"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse comma-separated CORS origins string into list."""
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            if not v:
                return ["http://localhost:3000", "http://localhost:5173"]
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return ["http://localhost:3000", "http://localhost:5173"]


settings = Settings()
