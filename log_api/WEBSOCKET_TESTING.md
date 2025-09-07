# 🔌 WebSocket Testing Guide - HackOdisha Log API

## 🚀 Quick Start

### 1. **Interactive Browser Testing**
Open `websocket_test.html` in your browser:
```bash
# Open in browser
open websocket_test.html
# OR
python -m http.server 8080
# Then visit: http://localhost:8080/websocket_test.html
```

### 2. **Python Client Testing**
```bash
# Install dependencies
pip install websockets requests

# Run the interactive client
python websocket_client.py

# OR run the simple automated test
python test_websocket_simple.py
```

### 3. **Browser Console Testing**
Open browser dev tools console and run:
```javascript
// Connect to live logs
const ws = new WebSocket('ws://localhost:8001/ws/logs?limit=10');
ws.onmessage = (e) => console.log('📨', JSON.parse(e.data));

// Connect to real-time stream  
const stream = new WebSocket('ws://localhost:8001/ws/stream');
stream.onmessage = (e) => console.log('🔄', JSON.parse(e.data));
```

## 📡 WebSocket Endpoints

### **🗂️ Live Logs: `/ws/logs`**
- **Purpose**: Get existing logs + real-time updates
- **Parameters**: 
  - `user_id` (optional): Filter by user
  - `limit` (optional): Number of logs (default: 100)
  - `offset` (optional): Pagination offset (default: 0)
- **Example**: `ws://localhost:8001/ws/logs?user_id=test_user&limit=50`

### **⚡ Real-time Stream: `/ws/stream`**
- **Purpose**: Real-time updates only (no initial data)
- **Parameters**:
  - `user_id` (optional): Filter updates by user
- **Example**: `ws://localhost:8001/ws/stream?user_id=test_user`

## 📨 Message Types

### 1. **`logs_response`** - Initial logs with metadata
```json
{
  "type": "logs_response",
  "user_filter": "test_user",
  "limit": 50,
  "offset": 0,
  "count": 25,
  "logs": [...]
}
```

### 2. **`heartbeat`** - Connection keep-alive
```json
{
  "type": "heartbeat", 
  "timestamp": "2024-01-01T12:00:00Z",
  "active_connections": 3
}
```

### 3. **`initial_logs`** - Initial batch from stream
```json
{
  "type": "initial_logs",
  "count": 50,
  "user_filter": null,
  "logs": [...]
}
```

### 4. **Log Entry** - Real-time log update
```json
{
  "id": "uuid",
  "user_id": "test_user",
  "query": "SELECT * FROM users",
  "status": "SUCCESS", 
  "timestamp": "2024-01-01T12:00:00Z",
  "hash": "tamper_proof_hash"
}
```

## 🧪 Testing Workflow

### **Step 1: Start API**
```bash
docker compose up -d
```

### **Step 2: Login & Get Token**
```bash
curl -X POST http://localhost:8001/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user"}'
```

### **Step 3: Connect WebSocket**
```javascript
const ws = new WebSocket('ws://localhost:8001/ws/logs?limit=10');
ws.onopen = () => console.log('✅ Connected');
ws.onmessage = (e) => console.log('📨', JSON.parse(e.data));
```

### **Step 4: Create Test Logs**
```bash
curl -X PUT http://localhost:8001/api/v1/logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM test", "status": "SUCCESS"}'
```

### **Step 5: Watch Real-time Updates**
You should see the new log appear in your WebSocket connection instantly!

## 📋 Available in FastAPI Docs

### **API Documentation**
- **Main Docs**: `http://localhost:8001/docs`
- **WebSocket Info**: `http://localhost:8001/api/v1/websocket-info`
- **Interactive Test**: `http://localhost:8001/api/v1/websocket-docs`

The FastAPI docs at `/docs` now include:
- ✅ Complete WebSocket documentation
- ✅ JavaScript examples  
- ✅ Parameter descriptions
- ✅ Message type specifications
- ✅ Testing instructions

## 🔧 Troubleshooting

### **Connection Issues**
```bash
# Check if API is running
curl http://localhost:8001/

# Check WebSocket endpoint info
curl http://localhost:8001/api/v1/websocket-info

# Check container logs
docker compose logs log_api --tail=20
```

### **Authentication Issues**
```bash
# Test login
curl -X POST http://localhost:8001/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user"}'

# Use the token from login response
```

### **No Real-time Updates**
1. Make sure you're connected to WebSocket
2. Create logs using authenticated PUT request
3. Check Redis is running: `docker compose logs redis`

## 🎯 Key Features Tested

- ✅ **Fast Redis Backend**: Sub-millisecond operations
- ✅ **Real-time Updates**: Instant WebSocket notifications  
- ✅ **Authentication**: Token-based session management
- ✅ **Tamper-proof Logs**: HMAC-SHA256 verification
- ✅ **Structured Data**: user_id, query, status, timestamp, hash
- ✅ **Live Documentation**: Integrated in FastAPI docs

Your WebSocket API is now fully documented and ready for production! 🚀
