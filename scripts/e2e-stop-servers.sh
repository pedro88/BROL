#!/bin/bash
# Stop E2E test servers.
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
pkill -f "tsx.*src/server.ts" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
echo "🛑 Servers stopped"
