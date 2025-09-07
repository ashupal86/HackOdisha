"""
Additional utilities
"""
from .exceptions import (
    DuplicateValueError,
    handle_integrity_error,
    check_duplicate_user_fields,
    check_duplicate_admin_fields,
)
from .hashing import generate_salt, hash_with_salt, verify_hash_with_salt, generate_api_key
from .admin_safety import (
    ensure_super_admin_exists,
    can_delete_admin,
    get_admin_safety_status,
    count_active_super_admins,
    create_default_super_admin,
)

__all__ = [
    "DuplicateValueError",
    "handle_integrity_error", 
    "check_duplicate_user_fields",
    "check_duplicate_admin_fields",
    "generate_salt",
    "hash_with_salt",
    "verify_hash_with_salt",
    "generate_api_key",
    "ensure_super_admin_exists",
    "can_delete_admin",
    "get_admin_safety_status",
    "count_active_super_admins",
    "create_default_super_admin",
]
