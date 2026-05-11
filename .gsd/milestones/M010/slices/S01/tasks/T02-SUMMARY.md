---
id: T02
parent: S01
milestone: M010
key_files:
  - (none)
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-11T12:45:49.491Z
blocker_discovered: false
---

# T02: useQrDownload encodes full URL in downloaded/printed QR codes

**useQrDownload encodes full URL in downloaded/printed QR codes**

## What Happened

Added `baseUrl?: string` parameter to useQrDownload hook. Both downloadPng and printQr now compute `qrData = baseUrl ? \`${baseUrl}/qr/${code}\` : code` before generating the QR. This ensures downloaded and printed QR codes also encode the full URL.

## Verification

grep -n 'baseUrl\\|qrData' apps/web/src/components/qr/qr-code-image.tsx | grep -E 'downloadPng|printQr'

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -n 'baseUrl\|qrData' apps/web/src/components/qr/qr-code-image.tsx | grep -E 'downloadPng|printQr'` | 0 | ✅ pass | 14ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

None.
