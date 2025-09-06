import hashlib
import hmac
from datetime import datetime
from .config import settings


def generate_log_hash(user_id: str, query: str, status: str, timestamp: datetime) -> str:
    """
    Generate a tamper-proof hash for log entry using HMAC-SHA256
    
    Args:
        user_id: User identifier
        query: The query that was executed
        status: Status of the operation
        timestamp: When the log was created
    
    Returns:
        Hexadecimal hash string
    """
    # Create a consistent string representation of the log data
    log_data = f"{user_id}|{query}|{status}|{timestamp.isoformat()}"
    
    # Use HMAC with secret key for tamper-proof hashing
    secret_key = settings.JWT_SECRET_KEY.encode('utf-8')
    hash_object = hmac.new(secret_key, log_data.encode('utf-8'), hashlib.sha256)
    
    return hash_object.hexdigest()


def verify_log_hash(user_id: str, query: str, status: str, timestamp: datetime, provided_hash: str) -> bool:
    """
    Verify if the provided hash matches the expected hash for the log data
    
    Args:
        user_id: User identifier
        query: The query that was executed
        status: Status of the operation
        timestamp: When the log was created
        provided_hash: The hash to verify
    
    Returns:
        True if hash is valid, False otherwise
    """
    expected_hash = generate_log_hash(user_id, query, status, timestamp)
    
    # Use hmac.compare_digest for timing-safe comparison
    return hmac.compare_digest(expected_hash, provided_hash)


def generate_verification_token(log_id: str, hash_value: str) -> str:
    """
    Generate a verification token that can be used to validate log integrity
    
    Args:
        log_id: Unique log identifier
        hash_value: The log's hash value
    
    Returns:
        Verification token
    """
    token_data = f"{log_id}|{hash_value}"
    secret_key = settings.JWT_SECRET_KEY.encode('utf-8')
    
    token_hash = hmac.new(secret_key, token_data.encode('utf-8'), hashlib.sha256)
    return token_hash.hexdigest()


def verify_log_integrity(log_data: dict) -> dict:
    """
    Verify the integrity of a log entry and return verification status
    
    Args:
        log_data: Dictionary containing log data with hash
    
    Returns:
        Dictionary with verification results
    """
    try:
        # Extract log data
        user_id = log_data.get('user_id')
        query = log_data.get('query')
        status = log_data.get('status')
        timestamp_str = log_data.get('timestamp')
        provided_hash = log_data.get('hash')
        
        if not all([user_id, query, status, timestamp_str, provided_hash]):
            return {
                "valid": False,
                "error": "Missing required fields for verification"
            }
        
        # Parse timestamp
        timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        
        # Verify hash
        is_valid = verify_log_hash(user_id, query, status, timestamp, provided_hash)
        
        return {
            "valid": is_valid,
            "verification_token": generate_verification_token(log_data.get('id', ''), provided_hash) if is_valid else None,
            "error": None if is_valid else "Hash verification failed - log may have been tampered with"
        }
        
    except Exception as e:
        return {
            "valid": False,
            "error": f"Verification error: {str(e)}"
        }
