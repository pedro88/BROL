---
id: T06
parent: S02
milestone: M010
key_files:
  - (none)
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-11T12:46:20.613Z
blocker_discovered: false
---

# T06: get-local-ip.js detects LAN IP and prints full URL for .env.local

**get-local-ip.js detects LAN IP and prints full URL for .env.local**

## What Happened

Created scripts/get-local-ip.js as a pure Node.js script (no npm deps). Uses os.networkInterfaces() to enumerate all interfaces, filters LAN ranges (10.x.x.x, 192.168.x.x, 172.16-31.x.x), excludes loopback/ link-local/ Docker. Prints all found IPs with the recommended one marked with arrow, and the full URL ready to copy.

## Verification

node scripts/get-local-ip.js → exit 0, outputs IP and URL

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `node scripts/get-local-ip.js` | 0 | ✅ pass | 30ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

None.
