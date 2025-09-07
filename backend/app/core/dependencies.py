"""
Common dependencies for FastAPI routes
"""
from typing import Optional, Union
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

from app.db import get_session
from app.models import User, Admin
from app.core.jwt_handler import verify_token
from app.schemas.auth import TokenData

# Security scheme for JWT tokens
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
) -> Union[User, Admin]:
    """
    Get current authenticated user (User or Admin)
    
    Args:
        credentials: JWT token from Authorization header
        session: Database session
        
    Returns:
        User or Admin object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(credentials.credentials)
    if token_data is None or token_data.user_id is None:
        raise credentials_exception
    
    # Try to find user in User table first
    user = session.get(User, token_data.user_id)
    if user:
        return user
    
    # If not found in User table, try Admin table
    admin = session.get(Admin, token_data.user_id)
    if admin:
        return admin
    
    raise credentials_exception


async def get_current_active_user(
    current_user: Union[User, Admin] = Depends(get_current_user),
) -> Union[User, Admin]:
    """
    Get current active user
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Active user object
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user


async def get_current_admin(
    current_user: Union[User, Admin] = Depends(get_current_active_user),
) -> Admin:
    """
    Get current admin user (admin or super_admin role)
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Admin object
        
    Raises:
        HTTPException: If user is not an admin
    """
    if not isinstance(current_user, Admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin access required.",
        )
    
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin role required.",
        )
    
    return current_user


async def get_current_super_admin(
    current_admin: Admin = Depends(get_current_admin),
) -> Admin:
    """
    Get current super admin user
    
    Args:
        current_admin: Current admin user
        
    Returns:
        Super admin object
        
    Raises:
        HTTPException: If user is not a super admin
    """
    if current_admin.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Super admin access required.",
        )
    
    return current_admin


def check_user_permissions(
    current_user: Union[User, Admin], required_role: str = None
) -> bool:
    """
    Check if user has required permissions
    
    Args:
        current_user: Current authenticated user
        required_role: Required role for access
        
    Returns:
        True if user has permissions, False otherwise
    """
    if not current_user.is_active:
        return False
    
    if required_role is None:
        return True
    
    # Admin and super_admin can access everything
    if isinstance(current_user, Admin) and current_user.role in ["admin", "super_admin"]:
        return True
    
    # Check specific role requirements
    if current_user.role == required_role:
        return True
    
    return False
