#!/bin/bash

echo "Cleaning up previous ConnectWise MCP server instances..."

# Kill any Node.js processes running our server script
pkill -f "node.*mcp-server.js" || true

# Check if any process is using our port
PORT=3456
PORT_PROCESS=$(lsof -i :$PORT | grep LISTEN | awk '{print $2}')
if [ ! -z "$PORT_PROCESS" ]; then
  echo "Port $PORT is in use by process $PORT_PROCESS. Killing it..."
  kill -9 $PORT_PROCESS || true
  sleep 1
fi

echo "Cleanup complete."
exit 0
