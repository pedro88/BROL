---
id: T04
parent: S01
milestone: M010
key_files:
  - (none)
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-11T12:45:59.301Z
blocker_discovered: false
---

# T04: QR stock page passes NEXT_PUBLIC_APP_URL as baseUrl

**QR stock page passes NEXT_PUBLIC_APP_URL as baseUrl**

## What Happened

Updated QR stock page to pass `baseUrl={process.env.NEXT_PUBLIC_APP_URL}` to QrCodeImage in the stock listing grid.

## Verification

grep -n 'baseUrl' apps/web/src/app/qr/page.tsx

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -n 'baseUrl' apps/web/src/app/qr/page.tsx` | 0 | ✅ pass | 8ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

None.
