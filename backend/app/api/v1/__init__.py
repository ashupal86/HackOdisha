"""
API v1 package
"""
from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .admins import router as admins_router

# Create main API v1 router
api_router = APIRouter(prefix="/api/v1")

# Include all route modules
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(admins_router)

__all__ = ["api_router"]
