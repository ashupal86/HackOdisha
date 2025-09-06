from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import settings
from .models import Session
import secrets


security = HTTPBearer()


def create_access_token(user_id: str) -> str:
    """Create a new access token for the user"""
    token = secrets.token_urlsafe(32)
    return token


def create_session(user_id: str) -> str:
    """Create a new session in Redis"""
    token = create_access_token(user_id)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    session = Session(token=token, user_id=user_id, expires_at=expires_at)
    session.save()
    
    return token


def verify_token(token: str) -> Optional[str]:
    """Verify if token is valid and return user_id"""
    session = Session.get_by_token(token)
    
    if session:
        return session.user_id
    return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Get current user from token"""
    token = credentials.credentials
    user_id = verify_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id
