# HackOdisha Log API - Usage Guide

A fast Redis-based logging API with WebSocket support for real-time log streaming and tamper-proof hash verification.

## Features

- ✅ **Fast Redis Backend**: Uses Redis for lightning-fast read/write operations
- ✅ **Real-time WebSocket**: Live log streaming via WebSocket connections
- ✅ **Authentication**: Simple token-based authentication
- ✅ **Tamper-proof Logs**: HMAC-SHA256 hash verification for log integrity
- ✅ **Docker Support**: Complete containerized setup

## Quick Start

1. **Start the services:**
   ```bash
   cd log_api
   docker-compose up --build
   ```

2. **API will be available at:** `http://localhost:8001`

## API Endpoints

### 1. Login (Get Session Token)
```bash
POST /api/v1/login
Content-Type: application/json

{
  "user_id": "your_user_id"
}
```

**Response:**
```json
{
  "access_token": "your_session_token",
  "token_type": "bearer"
}
```

### 2. Create Log Entry
```bash
PUT /api/v1/logs
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "query": "SELECT * FROM users WHERE id = 123",
  "status": "SUCCESS"
}
```

**Response:**
```json
{
  "id": "log_uuid",
  "user_id": "your_user_id", 
  "query": "SELECT * FROM users WHERE id = 123",
  "status": "SUCCESS",
  "timestamp": "2024-01-01T12:00:00Z",
  "hash": "tamper_proof_hash"
}
```

### 3. Verify Log Integrity
```bash
GET /api/v1/verify/{log_id}
```

**Response:**
```json
{
  "log_id": "log_uuid",
  "verification": {
    "valid": true,
    "verification_token": "verification_token",
    "error": null
  }
}
```

## WebSocket Endpoints

### 1. Live Log Streaming
```javascript
// Connect to live log stream
const ws = new WebSocket('ws://localhost:8001/ws/logs?user_id=test_user&limit=50');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    
    if (data.type === 'logs_response') {
        console.log('Initial logs:', data.logs);
    } else if (data.type === 'heartbeat') {
        console.log('Heartbeat:', data.active_connections);
    } else {
        console.log('New log:', data);
    }
};
```

### 2. Real-time Stream
```javascript
// Connect to real-time updates only
const ws = new WebSocket('ws://localhost:8001/ws/stream?user_id=test_user');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Real-time update:', data);
};
```

## Log Data Structure

Each log entry contains:
- **id**: Unique identifier
- **user_id**: User who created the log
- **query**: The query/operation that was logged
- **status**: Status of the operation (SUCCESS, ERROR, etc.)
- **timestamp**: ISO format timestamp
- **hash**: HMAC-SHA256 hash for tamper verification

## Security Features

### Hash Verification
Each log entry includes a tamper-proof hash generated using:
```
HMAC-SHA256(secret_key, user_id|query|status|timestamp)
```

### Session Management
- Sessions are stored in Redis with automatic expiration
- Tokens are cryptographically secure random strings
- Session verification on each authenticated request

## Testing

Run the test script:
```bash
cd log_api
python test_api.py
```

This will:
1. Test login functionality
2. Create test logs
3. Verify log integrity
4. Start WebSocket connection for live updates

## Docker Services

- **log_api**: FastAPI application (port 8001)
- **redis**: Redis database (port 6379)

## Environment Variables

Configure in `docker-compose.yml` or `.env`:
- `REDIS_URL`: Redis connection URL
- `JWT_SECRET_KEY`: Secret key for token generation
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time

## WebSocket Query Parameters

### `/ws/logs`
- `user_id` (optional): Filter logs by user
- `limit` (optional): Number of logs to return (default: 100)
- `offset` (optional): Offset for pagination (default: 0)

### `/ws/stream`
- `user_id` (optional): Filter real-time updates by user

## Example Integration

```python
import requests
import websocket
import json

# 1. Login
response = requests.post('http://localhost:8001/api/v1/login', 
                        json={'user_id': 'app_user'})
token = response.json()['access_token']

# 2. Create log
headers = {'Authorization': f'Bearer {token}'}
log_data = {
    'query': 'SELECT COUNT(*) FROM orders',
    'status': 'SUCCESS'
}
response = requests.put('http://localhost:8001/api/v1/logs', 
                       json=log_data, headers=headers)

# 3. Connect to WebSocket for live updates
ws = websocket.WebSocket()
ws.connect('ws://localhost:8001/ws/logs?limit=10')
while True:
    message = ws.recv()
    data = json.loads(message)
    print(f"Received: {data}")
```

## Performance

- **Redis**: Sub-millisecond read/write operations
- **WebSocket**: Real-time updates with minimal latency
- **Horizontal Scaling**: Can run multiple API instances
- **Memory Efficient**: Redis handles large log volumes efficiently

## Production Considerations

1. **Change Secret Keys**: Update `JWT_SECRET_KEY` in production
2. **Enable TLS**: Use HTTPS/WSS in production
3. **Redis Persistence**: Configure Redis AOF/RDB for data durability
4. **Rate Limiting**: Add rate limiting for API endpoints
5. **Monitoring**: Add logging and monitoring for the API itself
