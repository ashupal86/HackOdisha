from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from typing import List
from .models import LogEntry
from .log import LogCreate, LogResponse, LoginRequest, TokenResponse
from .auth import get_current_user, create_session
import threading
from .blockchain_storage import store_log_on_blockchain_background

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
    

    blockchain_thread = threading.Thread(
        target=store_log_on_blockchain_background,
        args=(log_entry.hash,),
        daemon=True
    )
    blockchain_thread.start()
    
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


@router.get("/websocket-docs", response_class=HTMLResponse, include_in_schema=False)
def websocket_documentation():
    """WebSocket testing interface"""
    with open("websocket_test.html", "r") as f:
        return f.read()


@router.get("/websocket-info")
def websocket_info():
    """Get WebSocket endpoint information"""
    return {
        "websocket_endpoints": {
            "logs": {
                "url": "ws://localhost:8001/ws/logs",
                "description": "Live log retrieval with pagination and real-time updates",
                "parameters": {
                    "user_id": "Optional - Filter logs by user",
                    "limit": "Optional - Number of logs to return (default: 100)",
                    "offset": "Optional - Offset for pagination (default: 0)"
                },
                "example": "ws://localhost:8001/ws/logs?user_id=test_user&limit=50&offset=0"
            },
            "stream": {
                "url": "ws://localhost:8001/ws/stream", 
                "description": "Real-time log stream only (no initial data)",
                "parameters": {
                    "user_id": "Optional - Filter real-time updates by user"
                },
                "example": "ws://localhost:8001/ws/stream?user_id=test_user"
            }
        },
        "message_types": {
            "logs_response": "Initial logs with metadata and pagination info",
            "heartbeat": "Connection keep-alive with connection count",
            "initial_logs": "Initial batch data from stream endpoint",
            "log_entry": "Real-time log updates with full log data (id, user_id, query, status, timestamp, hash)"
        },
        "testing": {
            "browser": "Visit /api/v1/websocket-docs for interactive testing",
            "javascript": "Use WebSocket API: new WebSocket('ws://localhost:8001/ws/logs')",
            "python": "Use websocket_client.py script for command-line testing"
        }
    }
