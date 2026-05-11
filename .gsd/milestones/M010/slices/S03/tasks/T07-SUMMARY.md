---
id: T07
parent: S03
milestone: M010
key_files:
  - (none)
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-11T12:46:31.712Z
blocker_discovered: false
---

# T07: dev:lan script added to apps/web/package.json

**dev:lan script added to apps/web/package.json**

## What Happened

Added `dev:lan` npm script in apps/web/package.json that runs `next dev --turbo -H 0.0.0.0`. This makes Next.js listen on all network interfaces instead of just localhost, enabling phones on the same WiFi to reach the dev server.

## Verification

grep -A1 '"dev:lan"' apps/web/package.json

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -A1 '"dev:lan"' apps/web/package.json` | 0 | ✅ pass | 10ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

None.
