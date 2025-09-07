from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .routes import router
from .websocket import manager, log_streamer, start_redis_listener, logs_websocket_handler
from .db import close_redis


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await start_redis_listener()
    yield
    # Shutdown
    await close_redis()


app = FastAPI(
    title="HackOdisha Log API",
    description="""
## HackOdisha Log API

A fast Redis-based logging API with WebSocket support for real-time log streaming.

### Features
- 🚀 **Fast Redis Backend**: Lightning-fast operations
- 🔐 **Authentication**: Token-based session management  
- 🔒 **Tamper-proof**: HMAC-SHA256 hash verification
- ⚡ **Real-time**: WebSocket streaming with Redis pub/sub
- 📊 **Structured Logs**: user_id, query, status, timestamp, hash

### WebSocket Endpoints
Since WebSocket endpoints don't appear in standard OpenAPI docs, here's how to use them:

#### 📡 Live Log Retrieval: `ws://localhost:8001/ws/logs`
Get logs with pagination and real-time updates.

**Query Parameters:**
- `user_id` (optional): Filter logs by user
- `limit` (optional): Number of logs to return (default: 100)
- `offset` (optional): Offset for pagination (default: 0)

**Example:**
```javascript
const ws = new WebSocket('ws://localhost:8001/ws/logs?user_id=test_user&limit=50');
ws.onmessage = (event) => console.log(JSON.parse(event.data));
```

#### 🔄 Real-time Stream: `ws://localhost:8001/ws/stream`
Real-time updates only (no initial data).

**Query Parameters:**
- `user_id` (optional): Filter updates by user

**Example:**
```javascript
const ws = new WebSocket('ws://localhost:8001/ws/stream?user_id=test_user');
ws.onmessage = (event) => console.log('New log:', JSON.parse(event.data));
```

### Testing WebSockets
1. Open `websocket_test.html` in your browser for interactive testing
2. Use `python websocket_client.py` for command-line testing
3. Use browser dev tools console with the examples above

### Message Types
- `logs_response`: Initial logs with metadata
- `heartbeat`: Connection keep-alive  
- `initial_logs`: Initial batch data
- Log entries: Real-time log updates with full log data
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {
        "message": "Welcome to the HackOdisha Log API",
        "status": "success",
        "version": "1.0.0",
        "endpoints": {
            "login": "POST /api/v1/login",
            "create_log": "PUT /api/v1/logs",
            "verify_log": "GET /api/v1/verify/{log_id}",
            "websocket_logs": "WS /ws/logs",
            "websocket_stream": "WS /ws/stream"
        }
    }


@app.websocket("/ws/logs")
async def websocket_logs_endpoint(websocket: WebSocket, user_id: str = None, limit: int = 100, offset: int = 0):
    """WebSocket endpoint for getting logs with live updates"""
    await logs_websocket_handler(websocket, user_id, limit, offset)


@app.websocket("/ws/stream")
async def websocket_stream_endpoint(websocket: WebSocket, user_id: str = None):
    """WebSocket endpoint for real-time log streaming"""
    await manager.connect(websocket, user_id)
    try:
        await log_streamer(websocket, user_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)