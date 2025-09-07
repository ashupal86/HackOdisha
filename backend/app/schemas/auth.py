"""
Authentication schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""
    user_id: Optional[uuid.UUID] = None
    username: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request schema"""
    username: str
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "password": "securepassword123"
            }
        }


class RegisterRequest(BaseModel):
    """User registration request schema"""
    username: str
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "securepassword123"
            }
        }
