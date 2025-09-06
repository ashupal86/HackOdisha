"""
Custom exception handlers and utilities
"""
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from psycopg2.errors import UniqueViolation
import re


class DuplicateValueError(Exception):
    """Raised when a duplicate value is detected"""
    
    def __init__(self, field: str, value: str):
        self.field = field
        self.value = value
        self.message = f"{field.title()} '{value}' already exists"
        super().__init__(self.message)


def handle_integrity_error(error: IntegrityError) -> HTTPException:
    """
    Convert SQLAlchemy IntegrityError to appropriate HTTPException
    
    Args:
        error: SQLAlchemy IntegrityError
        
    Returns:
        HTTPException with appropriate status and message
    """
    error_msg = str(error.orig)
    
    # Check for unique constraint violations
    if "unique constraint" in error_msg.lower() or isinstance(error.orig, UniqueViolation):
        # Extract field name from error message
        field_name = extract_field_from_error(error_msg)
        
        if field_name:
            return HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"{field_name.title()} already exists. Please choose a different {field_name}."
            )
        else:
            return HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A record with this information already exists."
            )
    
    # Check for foreign key constraint violations
    elif "foreign key constraint" in error_msg.lower():
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot perform this operation due to related data constraints."
        )
    
    # Check for check constraint violations
    elif "check constraint" in error_msg.lower():
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The provided data does not meet the required constraints."
        )
    
    # Generic database error
    else:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred. Please try again."
        )


def extract_field_from_error(error_msg: str) -> str:
    """
    Extract field name from database error message
    
    Args:
        error_msg: Database error message
        
    Returns:
        Field name that caused the error
    """
    # Common patterns for PostgreSQL unique constraint errors
    patterns = [
        r'Key \((\w+)\)=',  # Key (username)=
        r'constraint ".*_(\w+)_key"',  # constraint "user_username_key"
        r'column "(\w+)"',  # column "email"
        r'duplicate key value violates unique constraint ".*_(\w+)_',  # duplicate key value violates unique constraint "user_username_key"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, error_msg, re.IGNORECASE)
        if match:
            field_name = match.group(1)
            # Clean up field name
            if field_name.endswith('_key'):
                field_name = field_name[:-4]
            return field_name.lower()
    
    return ""


def check_duplicate_user_fields(session, username: str = None, email: str = None, exclude_id: str = None):
    """
    Check for duplicate username or email in User table
    
    Args:
        session: Database session
        username: Username to check
        email: Email to check
        exclude_id: User ID to exclude from check (for updates)
        
    Raises:
        DuplicateValueError: If duplicate found
    """
    from app.models import User
    from sqlmodel import select
    
    if username:
        query = select(User).where(User.username == username)
        if exclude_id:
            query = query.where(User.id != exclude_id)
        
        existing_user = session.exec(query).first()
        if existing_user:
            raise DuplicateValueError("username", username)
    
    if email:
        query = select(User).where(User.email == email)
        if exclude_id:
            query = query.where(User.id != exclude_id)
            
        existing_user = session.exec(query).first()
        if existing_user:
            raise DuplicateValueError("email", email)


def check_duplicate_admin_fields(session, username: str = None, email: str = None, exclude_id: str = None):
    """
    Check for duplicate username or email in Admin table
    
    Args:
        session: Database session
        username: Username to check
        email: Email to check
        exclude_id: Admin ID to exclude from check (for updates)
        
    Raises:
        DuplicateValueError: If duplicate found
    """
    from app.models import Admin
    from sqlmodel import select
    
    if username:
        query = select(Admin).where(Admin.username == username)
        if exclude_id:
            query = query.where(Admin.id != exclude_id)
            
        existing_admin = session.exec(query).first()
        if existing_admin:
            raise DuplicateValueError("username", username)
    
    if email:
        query = select(Admin).where(Admin.email == email)
        if exclude_id:
            query = query.where(Admin.id != exclude_id)
            
        existing_admin = session.exec(query).first()
        if existing_admin:
            raise DuplicateValueError("email", email)
