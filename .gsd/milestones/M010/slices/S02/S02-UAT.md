# S02: Local IP detection helper — UAT

**Milestone:** M010
**Written:** 2026-05-11T12:46:27.088Z

1. Run `node scripts/get-local-ip.js`
2. Verify it outputs at least one IP in the 10.x.x.x, 192.168.x.x, or 172.16-31.x.x ranges
3. Verify the suggested URL matches the detected IP and port 3000
4. Copy the NEXT_PUBLIC_APP_URL line into apps/web/.env.local
5. Try pinging the IP from another device on the same network
