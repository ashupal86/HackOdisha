from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # Redis settings
    REDIS_URL: str = "redis://redis:6379"
    
    # JWT settings
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # App settings
    APP_NAME: str = "HackOdisha Log API"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    
    # Admin settings
    ADMIN_SECRET_KEY: str = "your-admin-secret-key-change-in-production"
    
    # CORS settings
    ALLOWED_HOSTS: list[str] = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
