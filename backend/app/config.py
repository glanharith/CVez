import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "CVez Automated CV Tailoring"
    DEBUG: bool = True
    
    # Storage Directories
    TEMP_UPLOADS_DIR: Path = BASE_DIR / "temp_uploads"
    TEMP_OUTPUTS_DIR: Path = BASE_DIR / "temp_outputs"
    
    # Upload limits
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_MIME_TYPES: list[str] = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword"
    ]
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".docx", ".doc"]
    
    # API Keys
    OPENAI_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    
    # LLM Settings
    DEFAULT_LLM_PROVIDER: str = "openai"  # openai, anthropic, or gemini
    DEFAULT_MODEL_NAME: str = "gpt-4o-mini"
    
    class Config:
        env_file = BASE_DIR / ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
settings.TEMP_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.TEMP_OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
