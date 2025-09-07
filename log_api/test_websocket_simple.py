#!/usr/bin/env python3
"""
Simple WebSocket test for HackOdisha Log API
Install: pip install websockets requests
"""
import asyncio
import websockets
import requests
import json
import time

BASE_URL = "http://localhost:8001"
WS_URL = "ws://localhost:8001"

async def test_websocket():
    print("🚀 Testing HackOdisha Log API WebSocket")
    print("=" * 50)
    
    # Step 1: Login to get token
    print("1️⃣ Logging in...")
    try:
        response = requests.post(f"{BASE_URL}/api/v1/login", 
                               json={"user_id": "test_user"})
        token = response.json()["access_token"]
        print(f"✅ Got token: {token[:20]}...")
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return
    
    # Step 2: Connect to WebSocket
    print("\n2️⃣ Connecting to WebSocket...")
    try:
        websocket = await websockets.connect(f"{WS_URL}/ws/logs?limit=10")
        print("✅ WebSocket connected!")
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")
        return
    
    # Step 3: Listen for initial messages
    print("\n3️⃣ Listening for initial logs...")
    try:
        # Get initial message
        message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
        data = json.loads(message)
        print(f"📋 Received {data.get('count', 0)} initial logs")
        
        # Step 4: Create some test logs in background
        print("\n4️⃣ Creating test logs...")
        
        def create_test_log(query, status):
            try:
                requests.put(f"{BASE_URL}/api/v1/logs",
                           headers={"Authorization": f"Bearer {token}"},
                           json={"query": query, "status": status})
                print(f"✅ Created log: {query[:30]}...")
            except Exception as e:
                print(f"❌ Failed to create log: {e}")
        
        # Create test logs
        test_queries = [
            ("SELECT COUNT(*) FROM users WHERE active = true", "SUCCESS"),
            ("UPDATE user_sessions SET last_activity = NOW()", "SUCCESS"),
            ("DELETE FROM temp_logs WHERE created_at < NOW() - INTERVAL '1 day'", "ERROR"),
        ]
        
        # Create logs and listen for real-time updates
        for i, (query, status) in enumerate(test_queries):
            create_test_log(query, status)
            
            # Listen for the real-time update
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                data = json.loads(message)
                
                if data.get('query'):
                    print(f"📨 Real-time update: {data['query'][:30]}... [{data['status']}]")
                else:
                    print(f"📨 Message: {data.get('type', 'unknown')}")
                    
            except asyncio.TimeoutError:
                print(f"⏰ No real-time update received for log {i+1}")
            
            time.sleep(1)  # Small delay between logs
        
        print("\n5️⃣ Listening for heartbeats...")
        # Listen for a few more messages (heartbeats, etc.)
        for _ in range(3):
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                data = json.loads(message)
                msg_type = data.get('type', 'log_entry')
                
                if msg_type == 'heartbeat':
                    print(f"💓 Heartbeat: {data.get('active_connections', 0)} connections")
                elif data.get('query'):
                    print(f"📨 New log: {data['query'][:30]}...")
                else:
                    print(f"📨 Message type: {msg_type}")
                    
            except asyncio.TimeoutError:
                print("⏰ No more messages received")
                break
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
    
    finally:
        await websocket.close()
        print("\n🏁 Test completed!")

if __name__ == "__main__":
    print("Make sure the API is running: docker compose up")
    print("Starting test in 3 seconds...")
    time.sleep(3)
    
    try:
        asyncio.run(test_websocket())
    except KeyboardInterrupt:
        print("\n👋 Test interrupted!")
    except Exception as e:
        print(f"❌ Test failed: {e}")
