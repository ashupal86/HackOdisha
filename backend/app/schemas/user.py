"""
User schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
import datetime


class UserBase(BaseModel):
    """Base user schema"""
    username: str
    email: EmailStr


class UserCreate(UserBase):
    """User creation schema"""
    password: str


class UserUpdate(BaseModel):
    """User update schema"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_approved: Optional[bool] = None
    is_active: Optional[bool] = None
    is_blocked: Optional[bool] = None


class UserResponse(UserBase):
    """User response schema"""
    id: uuid.UUID
    is_approved: bool
    is_active: bool
    is_blocked: bool
    blocked_at: Optional[datetime.datetime] = None
    blocked_reason: Optional[str] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    
    class Config:
        from_attributes = True


class UserApprovalUpdate(BaseModel):
    """User approval update schema"""
    is_approved: bool


class UserBlockRequest(BaseModel):
    """User blocking request schema"""
    reason: Optional[str] = None


class UserUnblockRequest(BaseModel):
    """User unblocking request schema"""
    pass  # No additional fields needed for unblocking
