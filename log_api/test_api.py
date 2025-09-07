#!/usr/bin/env python3
"""
Simple test script for the Log API
"""
import requests
import json
import websocket
import threading
import time

BASE_URL = "http://localhost:8001"
WS_URL = "ws://localhost:8001"

def test_login():
    """Test login endpoint"""
    print("Testing login...")
    response = requests.post(f"{BASE_URL}/api/v1/login", json={"user_id": "test_user"})
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"✅ Login successful! Token: {token[:20]}...")
        return token
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_create_log(token):
    """Test log creation"""
    print("Testing log creation...")
    headers = {"Authorization": f"Bearer {token}"}
    log_data = {
        "query": "SELECT * FROM users WHERE id = 123",
        "status": "SUCCESS"
    }
    
    response = requests.put(f"{BASE_URL}/api/v1/logs", json=log_data, headers=headers)
    
    if response.status_code == 200:
        log_response = response.json()
        print("✅ Log created successfully!")
        print(f"   Log data: {log_response}")
        return log_response["id"]
    else:
        print(f"❌ Log creation failed: {response.text}")
        return None

def test_verify_log(log_id):
    """Test log verification"""
    if not log_id:
        print("⏭️  Skipping log verification (no log ID)")
        return
        
    print("Testing log verification...")
    response = requests.get(f"{BASE_URL}/api/v1/verify/{log_id}")
    
    if response.status_code == 200:
        verification = response.json()
        print("✅ Log verification completed!")
        print(f"   Verification result: {verification}")
    else:
        print(f"❌ Log verification failed: {response.text}")

def on_websocket_message(ws, message):
    """Handle WebSocket messages"""
    try:
        data = json.loads(message)
        msg_type = data.get("type", "unknown")
        
        if msg_type == "logs_response":
            print(f"📋 Initial logs received: {data.get('count', 0)} logs")
            if data.get('logs'):
                print(f"   Latest: {data['logs'][0].get('query', 'No query')[:50]}...")
        elif msg_type == "heartbeat":
            print(f"💓 Heartbeat: {data.get('active_connections', 0)} active connections")
        elif msg_type == "initial_logs":
            print(f"📋 Initial batch: {data.get('count', 0)} logs")
        elif msg_type == "ping":
            print(f"📡 Ping received at {data.get('timestamp', 'unknown time')}")
        else:
            # New log entry
            if data.get('query'):
                print(f"📨 New log: {data.get('query', 'No query')[:50]}... [{data.get('status', 'UNKNOWN')}]")
            else:
                print(f"📨 Raw message: {message}")
    except json.JSONDecodeError:
        print(f"📨 Raw message: {message}")

def on_websocket_error(ws, error):
    print(f"❌ WebSocket error: {error}")

def on_websocket_close(ws, close_status_code, close_msg):
    print("🔌 WebSocket connection closed")

def on_websocket_open(ws):
    print("🔌 WebSocket connection opened")

def test_websocket():
    """Test WebSocket connection for logs"""
    print("Testing WebSocket connection for logs...")
    ws = websocket.WebSocketApp(f"{WS_URL}/ws/logs",
                              on_open=on_websocket_open,
                              on_message=on_websocket_message,
                              on_error=on_websocket_error,
                              on_close=on_websocket_close)
    
    ws.run_forever()

def main():
    print("🚀 Starting Log API Test")
    print("=" * 50)
    
    # Test basic endpoints first
    token = test_login()
    if not token:
        return
    
    time.sleep(1)
    log_id = test_create_log(token)
    
    time.sleep(1)
    test_verify_log(log_id)
    
    # Start WebSocket test in background
    print("\n🔌 Starting WebSocket test...")
    print("   (This will run indefinitely - press Ctrl+C to stop)")
    ws_thread = threading.Thread(target=test_websocket)
    ws_thread.daemon = True
    ws_thread.start()
    
    # Create a few more logs to test real-time updates
    print("\n📝 Creating additional logs for real-time testing...")
    queries = [
        "SELECT COUNT(*) FROM orders WHERE status = 'pending'",
        "UPDATE users SET last_login = NOW() WHERE id = 456",
        "INSERT INTO audit_log (action, user_id) VALUES ('login', 789)"
    ]
    
    for i, query in enumerate(queries):
        time.sleep(2)
        log_data = {
            "query": query,
            "status": "SUCCESS" if i % 2 == 0 else "ERROR"
        }
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.put(f"{BASE_URL}/api/v1/logs", json=log_data, headers=headers)
        if response.status_code == 200:
            print(f"   ✅ Created log #{i+1}: {query[:30]}...")
    
    print("\n✨ Test completed! WebSocket is still running...")
    print("   Check the WebSocket output above for real-time log updates")
    
    # Keep the script running to show WebSocket messages
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")

if __name__ == "__main__":
    main()
