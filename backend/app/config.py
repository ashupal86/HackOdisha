"""
Application configuration settings
"""
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # Database settings
    DATABASE_URL: PostgresDsn = "postgresql://admin:admin123@localhost:5432/app_db"
    
    # JWT settings
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # App settings
    APP_NAME: str = "HackOdisha Backend"
    DEBUG: bool = False
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
