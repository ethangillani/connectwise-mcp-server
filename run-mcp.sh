#!/bin/bash

cd "$(dirname "$0")"
export CW_COMPANY_ID=microtech
export CW_PUBLIC_KEY=ghkvdcrdQCqcJgBJ
export CW_PRIVATE_KEY=4yZTDHWBXdmGa13j
export CW_URL=api-na.myconnectwise.net
export PORT=3456

# Check if the port is in use and kill the process if needed
PORT_PROCESS=$(lsof -i :$PORT | grep LISTEN | awk '{print $2}')
if [ ! -z "$PORT_PROCESS" ]; then
  echo "Port $PORT is in use by process $PORT_PROCESS. Killing it..."
  kill -9 $PORT_PROCESS
  sleep 1
fi

# Make the server script executable
chmod +x mcp-server.js

# Start the server
node mcp-server.js
