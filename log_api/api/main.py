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
    description="A fast Redis-based logging API with WebSocket support",
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