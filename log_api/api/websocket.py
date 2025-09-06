from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio
from datetime import datetime
from .db import get_redis
from .models import LogEntry


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            # Connection might be closed
            pass

    async def broadcast(self, message: str):
        for connection in self.active_connections.copy():
            try:
                await connection.send_text(message)
            except:
                # Connection might be closed, remove it
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

    async def broadcast_to_user(self, message: str, user_id: str):
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id].copy():
                try:
                    await connection.send_text(message)
                except:
                    # Connection might be closed, remove it
                    if connection in self.user_connections[user_id]:
                        self.user_connections[user_id].remove(connection)


manager = ConnectionManager()


async def get_recent_logs(user_id: str = None, limit: int = 50):
    """Get recent logs from Redis"""
    logs = LogEntry.get_logs(user_id=user_id, limit=limit, offset=0)
    return [log.to_dict() for log in logs]


async def redis_listener():
    """Listen for Redis pub/sub messages and broadcast to WebSocket clients"""
    redis_client = await get_redis()
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("log_updates")
    
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                # Broadcast new log to all connected clients
                await manager.broadcast(message["data"].decode())
    except Exception as e:
        print(f"Error in Redis listener: {e}")
    finally:
        await pubsub.unsubscribe("log_updates")
        await pubsub.close()


async def log_streamer(websocket: WebSocket, user_id: str = None, limit: int = 50):
    """Stream logs to WebSocket client with real-time updates"""
    try:
        # Send initial batch of recent logs
        recent_logs = await get_recent_logs(user_id=user_id, limit=limit)
        
        # Send initial response with metadata
        initial_response = {
            "type": "initial_logs",
            "count": len(recent_logs),
            "user_filter": user_id,
            "logs": recent_logs
        }
        await websocket.send_text(json.dumps(initial_response))
        
        # Keep connection alive and send real-time updates
        while True:
            await asyncio.sleep(30)  # Send heartbeat every 30 seconds
            
            # Send heartbeat
            heartbeat = {
                "type": "heartbeat",
                "timestamp": datetime.now().isoformat(),
                "active_connections": len(manager.active_connections)
            }
            await websocket.send_text(json.dumps(heartbeat))
            
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for user: {user_id}")
    except Exception as e:
        print(f"Error in log streamer: {e}")


async def logs_websocket_handler(websocket: WebSocket, user_id: str = None, limit: int = 100, offset: int = 0):
    """Handle WebSocket connections for live log streaming"""
    await manager.connect(websocket, user_id)
    
    try:
        # Send initial logs
        logs = LogEntry.get_logs(user_id=user_id, limit=limit, offset=offset)
        
        initial_data = {
            "type": "logs_response",
            "user_filter": user_id,
            "limit": limit,
            "offset": offset,
            "count": len(logs),
            "logs": [log.to_dict() for log in logs]
        }
        
        await websocket.send_text(json.dumps(initial_data))
        
        # Start real-time streaming
        await log_streamer(websocket, user_id, limit)
        
    except WebSocketDisconnect:
        print(f"Logs WebSocket disconnected for user: {user_id}")
    except Exception as e:
        print(f"Error in logs WebSocket handler: {e}")
    finally:
        manager.disconnect(websocket, user_id)


# Background task to start Redis listener
redis_listener_task = None

async def start_redis_listener():
    """Start the Redis listener as a background task"""
    global redis_listener_task
    if redis_listener_task is None:
        redis_listener_task = asyncio.create_task(redis_listener())
