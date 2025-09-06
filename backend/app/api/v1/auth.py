"""
Authentication API routes
"""
from datetime import datetime
from typing import Union

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.models import User, Admin
from app.schemas.auth import Token, LoginRequest, RegisterRequest
from app.schemas.user import UserResponse
from app.schemas.admin import AdminPasswordChange
from app.core.security import hash_password, verify_password
from app.core.jwt_handler import create_token_for_user
from app.core.dependencies import get_current_active_user
from app.utils.exceptions import DuplicateValueError, check_duplicate_user_fields, handle_integrity_error
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: RegisterRequest,
    session: Session = Depends(get_session),
):
    """
    Register a new user (pending approval)
    """
    try:
        # Check for duplicate username/email
        check_duplicate_user_fields(
            session, 
            username=user_data.username, 
            email=user_data.email
        )
        
        # Create new user
        # Password is already hashed by frontend, so we store it directly
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=user_data.password,  # Already hashed by frontend
            is_approved=False,  # Pending approval
        )
        
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        return new_user
        
    except DuplicateValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=e.message
        )
    except IntegrityError as e:
        session.rollback()
        raise handle_integrity_error(e)


@router.post("/login")
async def login(
    login_data: LoginRequest,
    session: Session = Depends(get_session),
):
    """
    Login user and return JWT token
    """
    # Try to find user in User table first
    user = session.exec(
        select(User).where(User.username == login_data.username)
    ).first()
    
    # If not found in User table, try Admin table
    if not user:
        admin = session.exec(
            select(Admin).where(Admin.username == login_data.username)
        ).first()
        if admin:
            user = admin
    
    # Verify user exists and password is correct
    password_valid = False
    if user:
        # Check if password is already hashed (starts with bcrypt hash pattern)
        if login_data.password.startswith(('$2a$', '$2b$', '$2y$', '\\$2a$', '\\$2b$', '\\$2y$')):
            # Password is pre-hashed, compare directly
            password_valid = login_data.password == user.password_hash
        else:
            # Password is plain text, check if stored password is hashed or plain text
            if user.password_hash.startswith(('$2a$', '$2b$', '$2y$')):
                # Stored password is hashed, use normal verification
                password_valid = verify_password(login_data.password, user.password_hash)
            else:
                # Both passwords are plain text, compare directly
                password_valid = login_data.password == user.password_hash
    
    if not user or not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account",
        )
    
    # For regular users, check if approved
    if isinstance(user, User) and not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account pending approval",
        )
    
    # Update last login for admins
    if isinstance(user, Admin):
        user.last_login = datetime.utcnow()
        session.add(user)
        session.commit()
    
    # Create access token
    access_token = create_token_for_user(user)
    
    # Check if admin needs to change password
    response_data = {"access_token": access_token, "token_type": "bearer"}
    if isinstance(user, Admin) and not user.password_changed:
        response_data["password_change_required"] = True
        response_data["message"] = "Password change required on first login"
    
    return response_data


@router.get("/me", response_model=Union[UserResponse, dict])
async def get_current_user_info(
    current_user: Union[User, Admin] = Depends(get_current_active_user),
):
    """
    Get current logged-in user information
    """
    if isinstance(current_user, User):
        return current_user
    else:
        # For Admin, return a custom response
        return {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role,
            "is_active": current_user.is_active,
            "created_at": current_user.created_at,
            "updated_at": current_user.updated_at,
            "last_login": current_user.last_login,
            "user_type": "admin",
        }


@router.post("/change-password")
async def change_password(
    password_data: AdminPasswordChange,
    current_user: Union[User, Admin] = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """
    Change admin password (required on first login)
    """
    # Only admins can change password through this endpoint
    if not isinstance(current_user, Admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for admin password changes only",
        )
    
    # Validate password requirements
    try:
        password_data.validate_passwords()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    
    # Update password
    current_user.password_hash = hash_password(password_data.new_password)
    current_user.password_changed = True
    current_user.updated_at = datetime.utcnow()
    
    session.add(current_user)
    session.commit()
    
    return {
        "message": "Password changed successfully",
        "password_changed": True,
    }
