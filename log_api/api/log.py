from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LogCreate(BaseModel):
    query: str
    status: str


class LogResponse(BaseModel):
    id: str
    user_id: str
    query: str
    status: str
    timestamp: datetime
    hash: str
    
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    user_id: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
