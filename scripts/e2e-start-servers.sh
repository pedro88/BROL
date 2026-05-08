#!/bin/bash
# Start both API and Web servers for E2E testing.
# Starts servers in background, waits for readiness, then exits.
# Stop: bash scripts/e2e-stop-servers.sh

set -e
cd /home/piet/Projets/webDev/BROL

echo "🧹 Cleaning ports..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
sleep 1

echo "🚀 Starting API server..."
nohup npx tsx --env-file=packages/api/.env packages/api/src/server.ts > /tmp/e2e-api.log 2>&1 &
API_PID=$!

echo "🚀 Starting Web server..."
nohup pnpm --filter=@brol/web dev > /tmp/e2e-web.log 2>&1 &
WEB_PID=$!

echo "⏳ Waiting (pids: api=$API_PID web=$WEB_PID)..."
for i in $(seq 1 90); do
  API_OK=false
  WEB_OK=false
  curl -sf http://localhost:3001/api/auth/get-session >/dev/null 2>&1 && API_OK=true
  curl -sf http://localhost:3000 >/dev/null 2>&1 && WEB_OK=true
  
  if $API_OK && $WEB_OK; then
    echo "🎉 Both servers ready after ${i}s"
    exit 0
  fi
  
  if $API_OK; then echo "  ✓ API ready (waiting web...)"; fi
  if $WEB_OK; then echo "  ✓ Web ready (waiting api...)"; fi
  
  sleep 1
done

echo "❌ Timeout waiting for servers"
echo "=== API log ==="
cat /tmp/e2e-api.log 2>/dev/null || echo "(no log)"
echo "=== Web log (tail) ==="
tail -20 /tmp/e2e-web.log 2>/dev/null || echo "(no log)"
exit 1
