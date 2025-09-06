from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from .models import LogEntry
from .log import LogCreate, LogResponse, LoginRequest, TokenResponse
from .auth import get_current_user, create_session


router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(login_request: LoginRequest):
    """Simple login endpoint that creates a session token"""
    if not login_request.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID is required"
        )
    
    token = create_session(login_request.user_id)
    return TokenResponse(access_token=token)


@router.put("/logs", response_model=LogResponse)
def create_log(
    log_data: LogCreate,
    current_user: str = Depends(get_current_user)
):
    """Create a new log entry (requires authentication)"""
    log_entry = LogEntry(
        user_id=current_user,
        query=log_data.query,
        status=log_data.status
    )
    
    log_entry.save()
    
    return LogResponse(**log_entry.to_dict())


@router.get("/verify/{log_id}")
def verify_log(log_id: str):
    """Verify the integrity of a specific log entry"""
    from .security import verify_log_integrity
    
    log_entry = LogEntry.get_by_id(log_id)
    if not log_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Log entry not found"
        )
    
    verification_result = verify_log_integrity(log_entry.to_dict())
    return {
        "log_id": log_id,
        "verification": verification_result
    }
