"""
User model for frontend users
"""
import uuid
import datetime
from sqlmodel import SQLModel, Field
from typing import Optional


class User(SQLModel, table=True):
    """Frontend user model"""
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    username: str = Field(index=True, unique=True, max_length=50)
    email: str = Field(index=True, unique=True, max_length=255)
    password_hash: str = Field(max_length=255)
    is_approved: bool = Field(default=False)
    is_active: bool = Field(default=True)
    is_blocked: bool = Field(default=False)  # Block status (True=blocked, False=not blocked)
    blocked_at: Optional[datetime.datetime] = Field(default=None)
    blocked_reason: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: Optional[datetime.datetime] = Field(default=None)
    
    @property
    def is_accessible(self) -> bool:
        """
        Check if user can access the system
        Blocked users cannot access regardless of approval/active status
        """
        return not self.is_blocked and self.is_active and self.is_approved
    
    def block_user(self, reason: str = None):
        """
        Block user and update related fields
        When blocked: is_approved=False, is_active=False, is_blocked=True
        """
        self.is_blocked = True
        self.is_approved = False
        self.is_active = False
        self.blocked_at = datetime.datetime.utcnow()
        self.blocked_reason = reason
        self.updated_at = datetime.datetime.utcnow()
    
    def unblock_user(self):
        """
        Unblock user and restore access
        When unblocked: is_blocked=False, is_active=True, is_approved=True
        """
        self.is_blocked = False
        self.is_active = True
        self.is_approved = True
        self.blocked_at = None
        self.blocked_reason = None
        self.updated_at = datetime.datetime.utcnow()
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "is_approved": False,
                "is_active": True,
                "is_blocked": False,
            }
        }
