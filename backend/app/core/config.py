import os
from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Scalable AI Backend"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Advanced AI backend with LeetCode problem training"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/aibackend"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # AI/ML Configuration
    MODEL_PATH: str = "./models"
    TRAINING_DATA_PATH: str = "./data"
    MAX_SEQUENCE_LENGTH: int = 512
    BATCH_SIZE: int = 32
    
    # External APIs
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # Performance
    WORKERS: int = 4
    MAX_CONNECTIONS: int = 100
    CACHE_TTL: int = 3600
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()