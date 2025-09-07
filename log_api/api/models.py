from datetime import datetime, timezone
from typing import Optional, Dict, Any
import json
import uuid
from .db import get_sync_redis
from .security import generate_log_hash


class LogEntry:
    def __init__(self, user_id: str, query: str, status: str, log_id: str = None):
        self.id = log_id or str(uuid.uuid4())
        self.user_id = user_id
        self.query = query
        self.status = status
        self.timestamp = datetime.now(timezone.utc)
        self.hash = generate_log_hash(user_id, query, status, self.timestamp)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "query": self.query,
            "status": self.status,
            "timestamp": self.timestamp.isoformat(),
            "hash": self.hash
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'LogEntry':
        log = cls.__new__(cls)
        log.id = data["id"]
        log.user_id = data["user_id"]
        log.query = data["query"]
        log.status = data["status"]
        log.timestamp = datetime.fromisoformat(data["timestamp"])
        log.hash = data["hash"]
        return log
    
    def save(self):
        """Save log entry to Redis"""
        redis_client = get_sync_redis()
        
        # Store the log entry
        redis_client.hset(f"log:{self.id}", mapping=self.to_dict())
        
        # Add to user's log list
        redis_client.lpush(f"user_logs:{self.user_id}", self.id)
        
        # Add to global log list (for all logs)
        redis_client.lpush("all_logs", self.id)
        
        # Publish to Redis pub/sub for real-time updates
        redis_client.publish("log_updates", json.dumps(self.to_dict()))
        
        # Keep only last 1000 logs per user
        redis_client.ltrim(f"user_logs:{self.user_id}", 0, 999)
        
        # Keep only last 1000 logs globally
        redis_client.ltrim("all_logs", 0, 999)
    
    @classmethod
    def get_by_id(cls, log_id: str) -> Optional['LogEntry']:
        """Get log entry by ID"""
        redis_client = get_sync_redis()
        data = redis_client.hgetall(f"log:{log_id}")
        
        if data:
            # Convert bytes to strings
            data = {k.decode(): v.decode() for k, v in data.items()}
            return cls.from_dict(data)
        return None
    
    @classmethod
    def get_logs(cls, user_id: str = None, limit: int = 100, offset: int = 0) -> list['LogEntry']:
        """Get logs with optional user filtering"""
        redis_client = get_sync_redis()
        
        key = f"user_logs:{user_id}" if user_id else "all_logs"
        log_ids = redis_client.lrange(key, offset, offset + limit - 1)
        
        logs = []
        for log_id in log_ids:
            log_id = log_id.decode() if isinstance(log_id, bytes) else log_id
            log = cls.get_by_id(log_id)
            if log:
                logs.append(log)
        
        return logs


class Session:
    def __init__(self, token: str, user_id: str, expires_at: datetime):
        self.token = token
        self.user_id = user_id
        self.created_at = datetime.now(timezone.utc)
        self.expires_at = expires_at
    
    def save(self):
        """Save session to Redis with expiration"""
        redis_client = get_sync_redis()
        
        session_data = {
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat()
        }
        
        # Calculate TTL in seconds
        ttl = int((self.expires_at - datetime.now(timezone.utc)).total_seconds())
        
        redis_client.setex(f"session:{self.token}", ttl, json.dumps(session_data))
    
    @classmethod
    def get_by_token(cls, token: str) -> Optional['Session']:
        """Get session by token"""
        redis_client = get_sync_redis()
        data = redis_client.get(f"session:{token}")
        
        if data:
            session_data = json.loads(data.decode())
            expires_at = datetime.fromisoformat(session_data["expires_at"])
            
            # Check if session is still valid
            if expires_at > datetime.now(timezone.utc):
                session = cls.__new__(cls)
                session.token = token
                session.user_id = session_data["user_id"]
                session.created_at = datetime.fromisoformat(session_data["created_at"])
                session.expires_at = expires_at
                return session
        
        return None
