"""
Additional hashing utilities
"""
import hashlib
import secrets
from typing import Tuple


def generate_salt(length: int = 32) -> str:
    """
    Generate a random salt for hashing
    
    Args:
        length: Length of the salt in bytes
        
    Returns:
        Hex encoded salt string
    """
    return secrets.token_hex(length)


def hash_with_salt(data: str, salt: str = None) -> Tuple[str, str]:
    """
    Hash data with salt using SHA-256
    
    Args:
        data: Data to hash
        salt: Optional salt (generates new one if not provided)
        
    Returns:
        Tuple of (hashed_data, salt)
    """
    if salt is None:
        salt = generate_salt()
    
    # Combine data and salt
    combined = f"{data}{salt}".encode('utf-8')
    
    # Hash using SHA-256
    hash_obj = hashlib.sha256(combined)
    hashed_data = hash_obj.hexdigest()
    
    return hashed_data, salt


def verify_hash_with_salt(data: str, hashed_data: str, salt: str) -> bool:
    """
    Verify data against hash with salt
    
    Args:
        data: Original data
        hashed_data: Hashed data to verify against
        salt: Salt used for hashing
        
    Returns:
        True if data matches, False otherwise
    """
    new_hash, _ = hash_with_salt(data, salt)
    return new_hash == hashed_data


def generate_api_key(length: int = 32) -> str:
    """
    Generate a secure API key
    
    Args:
        length: Length of the key in bytes
        
    Returns:
        URL-safe base64 encoded API key
    """
    return secrets.token_urlsafe(length)
