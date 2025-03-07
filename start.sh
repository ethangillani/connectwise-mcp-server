#!/bin/bash

cd "$(dirname "$0")"
export CW_COMPANY_ID=microtech
export CW_PUBLIC_KEY=ghkvdcrdQCqcJgBJ
export CW_PRIVATE_KEY=4yZTDHWBXdmGa13j
export CW_URL=api-na.myconnectwise.net
export PORT=9090

node dist/index.js
