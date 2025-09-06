"""
Admins API routes (super_admin-only access)
"""
from typing import List
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select

from app.db import get_session
from app.models import Admin
from app.schemas.admin import (
    AdminResponse,
    AdminCreate,
    AdminRoleUpdate,
)
from app.core.security import hash_password
from app.core.dependencies import get_current_super_admin
from app.utils.exceptions import DuplicateValueError, check_duplicate_admin_fields, handle_integrity_error
from app.utils.admin_safety import can_delete_admin, get_admin_safety_status
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/admins", tags=["Admins"])


@router.get("/", response_model=List[AdminResponse])
async def get_admins(
    skip: int = Query(0, ge=0, description="Number of admins to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of admins to return"),
    role: str = Query(None, description="Filter by admin role"),
    session: Session = Depends(get_session),
    current_super_admin: Admin = Depends(get_current_super_admin),
):
    """
    Get list of all admins (super_admin-only)
    """
    query = select(Admin)
    
    # Apply role filter
    if role:
        query = query.where(Admin.role == role)
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    admins = session.exec(query).all()
    return admins


@router.get("/safety-status")
async def get_admin_safety_info(
    session: Session = Depends(get_session),
    current_super_admin: Admin = Depends(get_current_super_admin),
):
    """
    Get admin safety status (super_admin-only)
    
    Returns information about admin safety including:
    - Total active admins
    - Number of super admins
    - System safety status
    - Default super admin existence
    """
    safety_status = get_admin_safety_status(session)
    return {
        "status": "safe" if safety_status["system_safe"] else "unsafe",
        "message": "System has adequate admin coverage" if safety_status["system_safe"] else "⚠️ System needs more super admins",
        **safety_status
    }


@router.get("/{admin_id}", response_model=AdminResponse)
async def get_admin(
    admin_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_super_admin: Admin = Depends(get_current_super_admin),
):
    """
    Get specific admin by ID (super_admin-only)
    """
    admin = session.get(Admin, admin_id)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )
    return admin


@router.post("/", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
async def create_admin(
    admin_data: AdminCreate,
    session: Session = Depends(get_session),
    current_super_admin: Admin = Depends(get_current_super_admin),
):
    """
    Create new admin (super_admin-only)
    """
    try:
        # Check for duplicate username/email
        check_duplicate_admin_fields(
            session,
            username=admin_data.username,
            email=admin_data.email
        )
        
        # Validate role
        valid_roles = ["admin", "super_admin"]
        if admin_data.role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}",
            )
        
        # Create new admin
        hashed_password = hash_password(admin_data.password)
        new_admin = Admin(
            username=admin_data.username,
            email=admin_data.email,
            password_hash=hashed_password,
            role=admin_data.role,
        )
        
        session.add(new_admin)
        session.commit()
        session.refresh(new_admin)
        
        return new_admin
        
    except DuplicateValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=e.message
        )
    except IntegrityError as e:
        session.rollback()
        raise handle_integrity_error(e)


@router.patch("/{admin_id}/role", response_model=AdminResponse)
async def update_admin_role(
    admin_id: uuid.UUID,
    role_data: AdminRoleUpdate,
    session: Session = Depends(get_session),
    current_super_admin: Admin = Depends(get_current_super_admin),
):
    """
    Update admin role (super_admin-only)
    """
    admin = session.get(Admin, admin_id)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )
    
    # Prevent super_admin from demoting themselves
    if admin.id == current_super_admin.id and role_data.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote yourself from super_admin role",
        )
    
    # Validate role
    valid_roles = ["admin", "super_admin"]
    if role_data.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}",
        )
    
    admin.role = role_data.role
    admin.updated_at = datetime.utcnow()
    
    session.add(admin)
    session.commit()
    session.refresh(admin)
    
    return admin


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin(
    admin_id: uuid.UUID,
    hard_delete: bool = False,  # Query parameter for hard delete
    session: Session = Depends(get_session),
    current_super_admin: Admin = Depends(get_current_super_admin),
):
    """
    Delete admin account (super_admin-only)
    
    By default performs soft delete (sets is_active=False).
    Use ?hard_delete=true for permanent deletion.
    """
    admin = session.get(Admin, admin_id)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )
    
    # Prevent super_admin from deleting themselves
    if admin.id == current_super_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super admin cannot delete themselves",
        )
    
    # Check if admin can be safely deleted (prevents deleting last super admin)
    can_delete, reason = can_delete_admin(session, admin_id)
    if not can_delete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason,
        )
    
    if hard_delete:
        # Hard delete - permanently remove from database
        session.delete(admin)
        session.commit()
    else:
        # Soft delete - keep for audit trail but mark as inactive
        admin.is_active = False
        admin.updated_at = datetime.utcnow()
        session.add(admin)
        session.commit()
    
    return None
