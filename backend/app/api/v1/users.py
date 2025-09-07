from typing import List
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select

from app.db import get_session
from app.models import User, Admin
from app.schemas.user import (
    UserResponse,
    UserApprovalUpdate,
    UserBlockRequest,
    UserUnblockRequest,
)
from app.core.dependencies import get_current_admin, get_current_super_admin

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of users to return"),
    is_approved: bool = Query(None, description="Filter by approval status"),
    session: Session = Depends(get_session),
    current_admin: Admin = Depends(get_current_admin),
):
    """
    Get list of all users (admin-only)
    """
    query = select(User)
    
    # Apply filters
    if is_approved is not None:
        query = query.where(User.is_approved == is_approved)
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    users = session.exec(query).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_admin: Admin = Depends(get_current_admin),
):
    """
    Get specific user by ID (admin-only)
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.patch("/{user_id}/approve", response_model=UserResponse)
async def approve_user(
    user_id: uuid.UUID,
    approval_data: UserApprovalUpdate,
    session: Session = Depends(get_session),
    current_admin: Admin = Depends(get_current_admin),
):
    """
    Approve or reject user (admin-only)
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.is_approved = approval_data.is_approved
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user



@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    hard_delete: bool = False,  # Query parameter for hard delete
    session: Session = Depends(get_session),
    current_super_admin: Admin = Depends(get_current_super_admin),
):
    """
    Delete user account (super_admin-only)
    
    By default performs soft delete (sets is_active=False).
    Use ?hard_delete=true for permanent deletion.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if hard_delete:
        # Hard delete - permanently remove from database
        session.delete(user)
        session.commit()
    else:
        # Soft delete - keep for audit trail but mark as inactive
        user.is_active = False
        user.updated_at = datetime.utcnow()
        session.add(user)
        session.commit()
    
    return None


@router.get("/roles")
async def get_available_roles(
    current_admin: Admin = Depends(get_current_admin),
):
    """
    Get available user roles with descriptions (admin-only)
    """
    from app.models import User
    roles = User.get_available_roles()
    
    return {
        "roles": [
            {
                "value": role_key,
                "label": role_desc.split(" - ")[0],
                "description": role_desc.split(" - ")[1] if " - " in role_desc else role_desc,
                "full_description": role_desc
            }
            for role_key, role_desc in roles.items()
        ],
        "total_roles": len(roles)
    }


@router.post("/{user_id}/block", response_model=UserResponse)
async def block_user(
    user_id: uuid.UUID,
    block_request: UserBlockRequest,
    session: Session = Depends(get_session),
    current_admin: Admin = Depends(get_current_admin),
):
    """
    Block a user (admin-only)
    
    When blocked:
    - is_blocked = True
    - is_approved = False
    - is_active = False
    - blocked_at = current timestamp
    - blocked_reason = provided reason
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already blocked",
        )
    
    # Use the model method to block user
    user.block_user(reason=block_request.reason)
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user


@router.post("/{user_id}/unblock", response_model=UserResponse)
async def unblock_user(
    user_id: uuid.UUID,
    unblock_request: UserUnblockRequest,
    session: Session = Depends(get_session),
    current_admin: Admin = Depends(get_current_admin),
):
    """
    Unblock a user (admin-only)
    
    When unblocked:
    - is_blocked = False
    - is_approved = True
    - is_active = True
    - blocked_at = None
    - blocked_reason = None
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if not user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not currently blocked",
        )
    
    # Use the model method to unblock user
    user.unblock_user()
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user


@router.get("/{user_id}/status")
async def get_user_status(
    user_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_admin: Admin = Depends(get_current_admin),
):
    """
    Get user access status (admin-only)
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return {
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "role_description": user.get_role_description(),
        "is_advanced": user.is_advanced,
        "user_type": "Advanced" if user.is_advanced else "Basic",
        "is_approved": user.is_approved,
        "is_active": user.is_active,
        "is_blocked": user.is_blocked,
        "is_accessible": user.is_accessible,
        "blocked_at": user.blocked_at,
        "blocked_reason": user.blocked_reason,
        "status_summary": {
            "can_access": user.is_accessible,
            "status": "blocked" if user.is_blocked else ("active" if user.is_accessible else "inactive"),
            "restrictions": [r for r in [
                "blocked" if user.is_blocked else None,
                "not_approved" if not user.is_approved else None,
                "not_active" if not user.is_active else None,
            ] if r is not None]
        }
    }
