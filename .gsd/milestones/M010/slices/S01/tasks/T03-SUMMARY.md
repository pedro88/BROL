---
id: T03
parent: S01
milestone: M010
key_files:
  - (none)
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-11T12:45:55.311Z
blocker_discovered: false
---

# T03: Object detail page passes NEXT_PUBLIC_APP_URL as baseUrl

**Object detail page passes NEXT_PUBLIC_APP_URL as baseUrl**

## What Happened

Updated object detail page to pass `baseUrl={process.env.NEXT_PUBLIC_APP_URL}` to both the QrCodeImage component (display) and the useQrDownload hook (download/print actions).

## Verification

grep -n 'baseUrl' apps/web/src/app/objects/[id]/page.tsx

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -n 'baseUrl' apps/web/src/app/objects/[id]/page.tsx` | 0 | ✅ pass | 10ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

None.
