"""
V2 Users API routes - Auth only
"""
from fastapi import APIRouter

# Empty router for V2 users - only auth is available in v2/auth.py
router = APIRouter(prefix="/users", tags=["V2 Users"])


