"""
Admin model for panel accounts
"""
import uuid
import datetime
from sqlmodel import SQLModel, Field
from typing import Optional


class Admin(SQLModel, table=True):
    """Admin panel account model"""
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    username: str = Field(index=True, unique=True, max_length=50)
    email: str = Field(index=True, unique=True, max_length=255)
    password_hash: str = Field(max_length=255)
    role: str = Field(default="admin", max_length=50)  # admin, super_admin
    is_active: bool = Field(default=True)
    password_changed: bool = Field(default=False)  # Track if password has been changed from default
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: Optional[datetime.datetime] = Field(default=None)
    last_login: Optional[datetime.datetime] = Field(default=None)
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "admin_user",
                "email": "admin@example.com",
                "role": "admin",
                "is_active": True,
            }
        }
