---
id: S01
parent: M010
milestone: M010
provides:
  - QrCodeImage accepts baseUrl prop
  - useQrDownload accepts baseUrl parameter
  - Object detail and QR stock pages pass NEXT_PUBLIC_APP_URL
  - .env.example documents NEXT_PUBLIC_APP_URL usage
requires:
  []
affects:
  []
key_files:
  - apps/web/src/components/qr/qr-code-image.tsx
  - apps/web/src/app/objects/[id]/page.tsx
  - apps/web/src/app/qr/page.tsx
  - .env.example
key_decisions:
  - (none)
patterns_established:
  - (none)
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-05-11T12:46:14.336Z
blocker_discovered: false
---

# S01: QR encodes full URL via NEXT_PUBLIC_APP_URL

**QrCodeImage encodes full URL when baseUrl prop set, falls back to raw code otherwise**

## What Happened

Modified QrCodeImage to accept optional `baseUrl` prop. When provided, the QR encodes `{baseUrl}/qr/{code}` — enabling direct browser navigation from scan. Falls back to raw code when absent (no regression). Updated useQrDownload hook to also encode full URLs in downloaded/printed QR codes. Object detail page and QR stock page now pass `process.env.NEXT_PUBLIC_APP_URL` as baseUrl.

## Verification

All 5 tasks verified via grep. grep -n 'baseUrl' confirms changes in all 3 files. grep -A3 'QR' .env.example confirms documentation.

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

None.
