"""
JWT token handling utilities
"""
from datetime import datetime, timedelta
from typing import Optional, Union
import uuid

from jose import JWTError, jwt
from app.config import settings
from app.schemas.auth import TokenData


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Payload data to encode in the token
        expires_delta: Optional expiration time delta
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> Optional[TokenData]:
    """
    Verify and decode a JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        TokenData if valid, None if invalid
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id_str: str = payload.get("sub")
        username: str = payload.get("username")
        
        if user_id_str is None:
            return None
            
        # Convert string UUID back to UUID object
        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            return None
            
        token_data = TokenData(
            user_id=user_id, username=username
        )
        return token_data
    except JWTError:
        return None


def create_token_for_user(user) -> str:
    """
    Create a JWT token for a specific user
    
    Args:
        user: User or Admin object
        
    Returns:
        JWT token string
    """
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "username": user.username,
        },
        expires_delta=access_token_expires,
    )
    return access_token
