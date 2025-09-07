"""
Pydantic schemas package
"""
from .auth import Token, TokenData, LoginRequest, RegisterRequest
from .user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserApprovalUpdate,
    UserBlockRequest,
    UserUnblockRequest,
)
from .admin import AdminBase, AdminCreate, AdminUpdate, AdminResponse, AdminRoleUpdate

__all__ = [
    "Token",
    "TokenData",
    "LoginRequest",
    "RegisterRequest",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserApprovalUpdate",
    "UserBlockRequest",
    "UserUnblockRequest",
    "AdminBase",
    "AdminCreate",
    "AdminUpdate",
    "AdminResponse",
    "AdminRoleUpdate",
]
