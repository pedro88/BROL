#!/bin/bash
# Script to start both API and Web servers for E2E testing.
# Kills any existing servers first, then starts fresh.
set -e

echo "🧹 Killing existing servers..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
sleep 2

echo "🚀 Starting API server (port 3001)..."
cd packages/api
npx tsx --env-file=.env src/server.ts &
API_PID=$!
cd ../..

# Wait for API
for i in $(seq 1 30); do
  if curl -s -o /dev/null http://localhost:3001/api/auth/get-session; then
    echo "✅ API server ready"
    break
  fi
  sleep 1
done

echo "🚀 Starting Web server (port 3000)..."
pnpm --filter=@brol/web dev &
WEB_PID=$!

# Wait for Web
for i in $(seq 1 60); do
  if curl -s -o /dev/null http://localhost:3000; then
    echo "✅ Web server ready"
    break
  fi
  sleep 1
done

echo "🎯 Both servers running (API=$API_PID, Web=$WEB_PID)"
echo "Use 'kill $API_PID $WEB_PID' to stop them."

# Keep script alive
wait
