#!/usr/bin/env python3
"""
WebSocket client for testing the HackOdisha Log API
"""
import asyncio
import websockets
import json
import sys
from datetime import datetime

class LogAPIWebSocketClient:
    def __init__(self, url="ws://localhost:8001"):
        self.base_url = url
        self.websocket = None
        
    async def connect_logs(self, user_id=None, limit=50, offset=0):
        """Connect to the logs WebSocket endpoint"""
        url = f"{self.base_url}/ws/logs"
        params = []
        
        if user_id:
            params.append(f"user_id={user_id}")
        if limit:
            params.append(f"limit={limit}")
        if offset:
            params.append(f"offset={offset}")
            
        if params:
            url += "?" + "&".join(params)
            
        print(f"🔌 Connecting to: {url}")
        
        try:
            self.websocket = await websockets.connect(url)
            print("✅ Connected to logs WebSocket!")
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False
    
    async def connect_stream(self, user_id=None):
        """Connect to the stream WebSocket endpoint"""
        url = f"{self.base_url}/ws/stream"
        if user_id:
            url += f"?user_id={user_id}"
            
        print(f"🔌 Connecting to: {url}")
        
        try:
            self.websocket = await websockets.connect(url)
            print("✅ Connected to stream WebSocket!")
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False
    
    async def listen(self):
        """Listen for messages from the WebSocket"""
        if not self.websocket:
            print("❌ Not connected to WebSocket")
            return
            
        try:
            print("🎧 Listening for messages... (Press Ctrl+C to stop)")
            async for message in self.websocket:
                timestamp = datetime.now().strftime("%H:%M:%S")
                
                try:
                    data = json.loads(message)
                    msg_type = data.get("type", "unknown")
                    
                    if msg_type == "logs_response":
                        print(f"[{timestamp}] 📋 Initial logs: {data.get('count', 0)} logs")
                        if data.get('logs'):
                            latest = data['logs'][0]
                            print(f"         Latest: {latest.get('query', 'No query')[:50]}...")
                    
                    elif msg_type == "heartbeat":
                        print(f"[{timestamp}] 💓 Heartbeat: {data.get('active_connections', 0)} connections")
                    
                    elif msg_type == "initial_logs":
                        print(f"[{timestamp}] 📋 Initial batch: {data.get('count', 0)} logs")
                    
                    elif data.get('query'):
                        print(f"[{timestamp}] 📨 New log: {data.get('query', '')[:50]}... [{data.get('status', 'UNKNOWN')}]")
                        print(f"         Hash: {data.get('hash', 'No hash')[:20]}...")
                    
                    else:
                        print(f"[{timestamp}] 📨 Message: {json.dumps(data, indent=2)}")
                        
                except json.JSONDecodeError:
                    print(f"[{timestamp}] 📨 Raw: {message}")
                    
        except websockets.exceptions.ConnectionClosed:
            print("🔌 WebSocket connection closed")
        except KeyboardInterrupt:
            print("\n👋 Stopping...")
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            if self.websocket:
                await self.websocket.close()

async def main():
    print("🚀 HackOdisha Log API - WebSocket Test Client")
    print("=" * 50)
    
    client = LogAPIWebSocketClient()
    
    # Menu
    print("\nChoose WebSocket endpoint:")
    print("1. /ws/logs (Live logs with pagination)")
    print("2. /ws/stream (Real-time stream only)")
    
    try:
        choice = input("\nEnter choice (1 or 2): ").strip()
        
        if choice == "1":
            user_id = input("User ID filter (optional): ").strip() or None
            limit = input("Limit (default 50): ").strip() or "50"
            offset = input("Offset (default 0): ").strip() or "0"
            
            connected = await client.connect_logs(
                user_id=user_id,
                limit=int(limit),
                offset=int(offset)
            )
            
        elif choice == "2":
            user_id = input("User ID filter (optional): ").strip() or None
            connected = await client.connect_stream(user_id=user_id)
            
        else:
            print("❌ Invalid choice")
            return
        
        if connected:
            await client.listen()
            
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    # Install dependencies: pip install websockets
    asyncio.run(main())
