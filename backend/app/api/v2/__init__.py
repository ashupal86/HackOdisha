"""
API v2 for frontend chat interface
"""
from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router

# Create v2 API router
api_router = APIRouter(prefix="/api/v2")

# Include all v2 routers
api_router.include_router(auth_router)
api_router.include_router(users_router)

__all__ = ["api_router"]
