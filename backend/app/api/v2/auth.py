"""
V2 Auth API routes for frontend chat interface
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Union

from app.db import get_session
from app.models import User
from app.schemas.auth import LoginRequest
from app.core.security import hash_password, verify_password
from app.core.jwt_handler import create_token_for_user
from app.core.dependencies import get_current_user
from app.utils.exceptions import DuplicateValueError, check_duplicate_user_fields, handle_integrity_error
from sqlalchemy.exc import IntegrityError
import datetime

router = APIRouter(prefix="/auth", tags=["V2 Authentication"])

# Frontend-specific schemas
from pydantic import BaseModel, EmailStr
from typing import Optional

class FrontendSignupRequest(BaseModel):
    """Frontend user signup request"""
    username: str
    email: EmailStr
    password: str

class FrontendLoginRequest(BaseModel):
    """Frontend login request"""
    username: str
    password: str

class FrontendUserResponse(BaseModel):
    """Frontend user response"""
    id: str
    username: str
    email: str
    is_approved: bool
    is_active: bool
    is_blocked: bool
    is_accessible: bool
    account_status: str
    created_at: str
    message: Optional[str] = None

class FrontendLoginResponse(BaseModel):
    """Frontend login response with token"""
    access_token: str
    token_type: str = "bearer"
    user: FrontendUserResponse

class FrontendProfileUpdate(BaseModel):
    """Frontend profile update request"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None


@router.post("/signup", response_model=FrontendUserResponse)
async def frontend_signup(
    signup_data: FrontendSignupRequest,
    session: Session = Depends(get_session),
):
    """
    Frontend user signup
    
    Creates a new user account that requires admin approval.
    Users can login but won't have access until approved.
    """
    try:
        # Check for duplicate username/email
        check_duplicate_user_fields(
            session, 
            username=signup_data.username, 
            email=signup_data.email
        )
        
        # Create new user (not approved by default)
        # Password is already hashed by frontend, so we store it directly
        new_user = User(
            username=signup_data.username,
            email=signup_data.email,
            password_hash=signup_data.password,  # Already hashed by frontend
            is_approved=False,  # Requires admin approval
            is_active=True,
            is_blocked=False,
        )
        
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        # Determine account status message
        status_message = "Account created successfully! Please wait for admin approval to access all features."
        
        return FrontendUserResponse(
            id=str(new_user.id),
            username=new_user.username,
            email=new_user.email,
            is_approved=new_user.is_approved,
            is_active=new_user.is_active,
            is_blocked=new_user.is_blocked,
            is_accessible=new_user.is_accessible,
            account_status="pending_approval",
            created_at=new_user.created_at.isoformat(),
            message=status_message
        )
        
    except DuplicateValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=e.message
        )
    except IntegrityError as e:
        session.rollback()
        raise handle_integrity_error(e)


@router.post("/login", response_model=FrontendLoginResponse)
async def frontend_login(
    login_data: FrontendLoginRequest,
    session: Session = Depends(get_session),
):
    """
    Frontend user login
    
    Allows users to login even if not approved, but shows appropriate status.
    """
    # Find user by username
    user = session.exec(
        select(User).where(User.username == login_data.username)
    ).first()
    
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
            detail="Invalid username or password",
        )
    
    # Check if user is blocked
    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked. Please contact support.",
        )
    
    # Update last login time
    user.updated_at = datetime.datetime.utcnow()
    session.add(user)
    session.commit()
    
    # Generate access token
    access_token = create_token_for_user(user)
    
    # Determine status message based on account state
    if user.is_blocked:
        status_message = "Your account is blocked. Please contact support."
        account_status = "blocked"
    elif not user.is_approved:
        status_message = "Your account is pending approval. Limited access available."
        account_status = "pending_approval"
    elif not user.is_active:
        status_message = "Your account is inactive. Please contact support."
        account_status = "inactive"
    else:
        status_message = "Login successful! Welcome back."
        account_status = "active"
    
    user_data = FrontendUserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        is_approved=user.is_approved,
        is_active=user.is_active,
        is_blocked=user.is_blocked,
        is_accessible=user.is_accessible,
        account_status=account_status,
        created_at=user.created_at.isoformat(),
        message=status_message,
    )
    
    return FrontendLoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_data
    )


@router.get("/me", response_model=FrontendUserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Get current user profile information
    """
    # Determine status message
    if current_user.is_blocked:
        status_message = "Your account is blocked."
        account_status = "blocked"
    elif not current_user.is_approved:
        status_message = "Your account is pending approval."
        account_status = "pending_approval"
    elif not current_user.is_active:
        status_message = "Your account is inactive."
        account_status = "inactive"
    else:
        status_message = "Your account is active."
        account_status = "active"
    
    return FrontendUserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        is_approved=current_user.is_approved,
        is_active=current_user.is_active,
        is_blocked=current_user.is_blocked,
        is_accessible=current_user.is_accessible,
        account_status=account_status,
        created_at=current_user.created_at.isoformat(),
        message=status_message
    )


@router.put("/profile", response_model=FrontendUserResponse)
async def update_user_profile(
    profile_data: FrontendProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Update user profile information
    """
    try:
        # Check for duplicates if updating username or email
        if profile_data.username and profile_data.username != current_user.username:
            check_duplicate_user_fields(session, username=profile_data.username)
            current_user.username = profile_data.username
        
        if profile_data.email and profile_data.email != current_user.email:
            check_duplicate_user_fields(session, email=profile_data.email)
            current_user.email = profile_data.email
        
        current_user.updated_at = datetime.datetime.utcnow()
        session.add(current_user)
        session.commit()
        session.refresh(current_user)
        
        return FrontendUserResponse(
            id=str(current_user.id),
            username=current_user.username,
            email=current_user.email,
            is_approved=current_user.is_approved,
            is_active=current_user.is_active,
            is_blocked=current_user.is_blocked,
            is_accessible=current_user.is_accessible,
            account_status="active" if current_user.is_accessible else "pending_approval",
            created_at=current_user.created_at.isoformat(),
            message="Profile updated successfully!"
        )
        
    except DuplicateValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=e.message
        )
    except IntegrityError as e:
        session.rollback()
        raise handle_integrity_error(e)


@router.get("/status")
async def get_auth_status(
    current_user: User = Depends(get_current_user),
):
    """
    Get authentication and account status for frontend
    """
    return {
        "authenticated": True,
        "user_id": str(current_user.id),
        "username": current_user.username,
        "is_approved": current_user.is_approved,
        "is_active": current_user.is_active,
        "is_blocked": current_user.is_blocked,
        "can_access_features": current_user.is_accessible,
        "account_status": {
            "approved": current_user.is_approved,
            "active": current_user.is_active,
            "blocked": current_user.is_blocked,
            "message": "Account approved and active" if current_user.is_accessible else 
                      "Account pending approval" if not current_user.is_approved else
                      "Account blocked" if current_user.is_blocked else
                      "Account inactive"
        }
    }


@router.post("/check-availability")
async def check_username_email_availability(
    data: dict,
    session: Session = Depends(get_session),
):
    """
    Check if username or email is available for registration
    """
    username = data.get("username")
    email = data.get("email")
    
    result = {
        "username_available": True,
        "email_available": True,
        "message": "Available"
    }
    
    if username:
        existing_user = session.exec(
            select(User).where(User.username == username)
        ).first()
        if existing_user:
            result["username_available"] = False
            result["message"] = "Username already taken"
    
    if email:
        existing_email = session.exec(
            select(User).where(User.email == email)
        ).first()
        if existing_email:
            result["email_available"] = False
            if result["message"] == "Username already taken":
                result["message"] = "Username and email already taken"
            else:
                result["message"] = "Email already taken"
    
    return result
