import redis.asyncio as redis
import redis as sync_redis
from .config import settings
import json
from typing import Optional

# Async Redis connection for WebSocket operations
async_redis_client = None

# Sync Redis connection for regular operations
sync_redis_client = None

async def get_redis():
    """Get async Redis client"""
    global async_redis_client
    if async_redis_client is None:
        async_redis_client = redis.from_url(settings.REDIS_URL)
    return async_redis_client

def get_sync_redis():
    """Get sync Redis client"""
    global sync_redis_client
    if sync_redis_client is None:
        sync_redis_client = sync_redis.from_url(settings.REDIS_URL)
    return sync_redis_client

async def close_redis():
    """Close Redis connections"""
    global async_redis_client, sync_redis_client
    if async_redis_client:
        await async_redis_client.close()
    if sync_redis_client:
        sync_redis_client.close()
        