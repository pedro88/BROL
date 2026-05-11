---
id: T01
parent: S01
milestone: M010
key_files:
  - (none)
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-11T12:45:42.652Z
blocker_discovered: false
---

# T01: QrCodeImage accepts baseUrl, encodes full URL when provided

**QrCodeImage accepts baseUrl, encodes full URL when provided**

## What Happened

Added optional `baseUrl?: string` prop to QrCodeImageProps interface. Modified QRCode.toDataURL and QRCode.toCanvas calls to use `qrData = baseUrl ? \`${baseUrl}/qr/${code}\` : code` instead of raw code. Updated JSDoc comments to document the new behavior.

## Verification

grep -n 'baseUrl' apps/web/src/components/qr/qr-code-image.tsx shows baseUrl in interface, props destructuring, and qrData computation

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -n 'baseUrl' apps/web/src/components/qr/qr-code-image.tsx` | 0 | ✅ pass | 12ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

None.
