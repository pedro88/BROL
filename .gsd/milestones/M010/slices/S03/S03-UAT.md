# S03: Dev server starts on LAN IP — UAT

**Milestone:** M010
**Written:** 2026-05-11T12:46:43.508Z

1. Run `node scripts/get-local-ip.js` → copy URL
2. Paste into `apps/web/.env.local`: `NEXT_PUBLIC_APP_URL="http://<ip>:3000"`
3. Start server: `pnpm --filter @brol/web dev:lan`
4. From phone browser on same WiFi, navigate to `http://<ip>:3000`
5. Verify page loads
6. Assign a QR to an object and scan it — verify it opens the object page
