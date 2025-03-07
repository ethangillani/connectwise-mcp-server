#!/bin/bash

# Enhanced logging
LOG_FILE="/tmp/connectwise-mcp-server.log"
echo "===== $(date) =====" > $LOG_FILE

cd "$(dirname "$0")"
echo "Working directory: $(pwd)" >> $LOG_FILE

# Set environment variables
export CW_COMPANY_ID=microtech
export CW_PUBLIC_KEY=ghkvdcrdQCqcJgBJ
export CW_PRIVATE_KEY=4yZTDHWBXdmGa13j
export CW_URL=api-na.myconnectwise.net
export PORT=3456

echo "Checking for processes using port $PORT..." >> $LOG_FILE

# Check if the port is in use and kill the process if needed
PORT_PROCESS=$(lsof -i :$PORT | grep LISTEN | awk '{print $2}')
if [ ! -z "$PORT_PROCESS" ]; then
  echo "Port $PORT is in use by process $PORT_PROCESS. Killing it..." | tee -a $LOG_FILE
  kill -9 $PORT_PROCESS 2>> $LOG_FILE
  sleep 2
  
  # Double-check if port is still in use
  PORT_PROCESS=$(lsof -i :$PORT | grep LISTEN | awk '{print $2}')
  if [ ! -z "$PORT_PROCESS" ]; then
    echo "FAILED: Port $PORT is still in use by process $PORT_PROCESS after attempted kill." | tee -a $LOG_FILE
    exit 1
  else
    echo "SUCCESS: Port $PORT is now free." | tee -a $LOG_FILE
  fi
else
  echo "Port $PORT is free." >> $LOG_FILE
fi

# Check if Node.js is available
echo "Checking Node.js version..." >> $LOG_FILE
NODE_VERSION=$(node --version 2>> $LOG_FILE)
echo "Node.js version: $NODE_VERSION" >> $LOG_FILE

# Make the server script executable
chmod +x mcp-server.js 2>> $LOG_FILE
echo "Made server script executable." >> $LOG_FILE

# Start the server
echo "Starting server..." | tee -a $LOG_FILE
node mcp-server.js 2>&1 | tee -a $LOG_FILE
