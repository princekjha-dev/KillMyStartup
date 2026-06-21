import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # API configuration
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = "anthropic/claude-3.5-sonnet:beta" # Default to Sonnet 3.5

    # Supabase configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None # Project API Key (Service Role or Anon)
    SUPABASE_JWT_SECRET: Optional[str] = None # Used for decoding JWT locally

    # Database configuration (Defaults to Supabase Postgres URL or standard env var)
    DATABASE_URL: Optional[str] = None

    # Rate limiting
    RATE_LIMIT_WINDOW_SECONDS: int = 3600 # 1 hour
    RATE_LIMIT_UNAUTH_MAX: int = 5
    RATE_LIMIT_AUTH_MAX_PER_DAY: int = 20

    # CORS configuration
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
