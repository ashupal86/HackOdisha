"""
Admin schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
import datetime


class AdminBase(BaseModel):
    """Base admin schema"""
    username: str
    email: EmailStr
    role: str = "admin"


class AdminCreate(AdminBase):
    """Admin creation schema"""
    password: str


class AdminUpdate(BaseModel):
    """Admin update schema"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class AdminResponse(AdminBase):
    """Admin response schema"""
    id: uuid.UUID
    is_active: bool
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    last_login: Optional[datetime.datetime] = None
    
    class Config:
        from_attributes = True


class AdminRoleUpdate(BaseModel):
    """Admin role update schema"""
    role: str


class AdminPasswordChange(BaseModel):
    """Admin password change schema"""
    current_password: str
    new_password: str
    confirm_password: str
    
    def validate_passwords(self):
        """Validate password requirements"""
        if self.new_password != self.confirm_password:
            raise ValueError("New password and confirmation do not match")
        if len(self.new_password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return True
