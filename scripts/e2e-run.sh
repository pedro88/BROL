#!/usr/bin/env bash
# Launch both API + Web servers for E2E tests, then run Playwright.
# Usage: bash scripts/e2e-run.sh [optional: playwright args]
# Examples:
#   bash scripts/e2e-run.sh                           # all tests
#   bash scripts/e2e-run.sh --grep "sign-up"         # filtered
#   bash scripts/e2e-run.sh --ui                      # UI mode
set -e
cd /home/piet/Projets/webDev/BROL

cleanup() {
  echo "🧹 Stopping servers..."
  fuser -k 3000/tcp 2>/dev/null || true
  fuser -k 3001/tcp 2>/dev/null || true
  pkill -f "tsx.*src/server.ts" 2>/dev/null || true
  pkill -f "next dev.*--turbo" 2>/dev/null || true
}
trap cleanup EXIT

# Kill any leftover
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
sleep 1

# --- Start API server (port 3001) ---
echo "🚀 Starting API server..."
(cd packages/api && npx tsx --env-file=.env src/server.ts > /tmp/e2e-api.log 2>&1 &)

# Wait for API
for i in $(seq 1 30); do
  if curl -sf http://localhost:3001/api/auth/get-session >/dev/null 2>&1; then
    echo "✅ API ready (${i}s)"
    break
  fi
  [ "$i" -eq 30 ] && { echo "❌ API failed to start"; cat /tmp/e2e-api.log; exit 1; }
  sleep 1
done

# --- Start Web server (port 3000) ---
echo "🚀 Starting Web server (dev mode)..."
pnpm --filter=@brol/web dev > /tmp/e2e-web.log 2>&1 &

# Wait for Web
for i in $(seq 1 90); do
  if curl -sf http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Web ready (${i}s)"
    break
  fi
  [ "$i" -eq 90 ] && { echo "❌ Web failed to start"; tail -30 /tmp/e2e-web.log; exit 1; }
  sleep 1
done

# --- Run tests ---
echo ""
echo "🎯 Running E2E tests..."
npx playwright test "$@"
