#!/bin/bash

# Install dependencies
npm install

# Build the project
npm run build

# Create a symbolic link to make the package globally available
npm link

echo "ConnectWise MCP Server has been installed locally."
echo "You can now use it with Claude Desktop by adding the appropriate configuration."
