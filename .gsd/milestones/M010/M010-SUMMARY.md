---
id: M010
title: "QR codes with local network URLs"
status: complete
completed_at: 2026-05-11T12:47:02.441Z
key_decisions:
  - Reused NEXT_PUBLIC_APP_URL — keeps config minimal, no new env var needed
  - dev:lan as separate script preserves default dev behavior for localhost-only workflows
key_files:
  - apps/web/src/components/qr/qr-code-image.tsx
  - apps/web/src/app/objects/[id]/page.tsx
  - apps/web/src/app/qr/page.tsx
  - .env.example
  - scripts/get-local-ip.js
  - apps/web/package.json
  - .gsd/KNOWLEDGE.md
lessons_learned:
  - NEXT_PUBLIC_APP_URL existed — should have checked first before planning a new QR-specific env var
---

# M010: QR codes with local network URLs

**QR codes encode full URL for LAN scanning with IP detection script and dev:lan server**

## What Happened

Implemented QR code local network scanning support across 3 slices. S01 modified QrCodeImage to accept a baseUrl prop and encode the full URL instead of raw code. S02 created a zero-dependency get-local-ip.js script. S03 added dev:lan npm script and documented the workflow in KNOWLEDGE.md."

## Success Criteria Results

- QR codes encode full URL when NEXT_PUBLIC_APP_URL set ✅
- Falls back to raw code when env var absent ✅
- get-local-ip.js works and outputs correct URL ✅
- dev:lan binds to 0.0.0.0 ✅
- Workflow documented in KNOWLEDGE.md ✅

## Definition of Done Results

- QrCodeImage encodes full URL when baseUrl provided ✅
- Falls back to raw code when baseUrl absent ✅
- useQrDownload encodes full URL in downloaded/printed QR ✅
- Object detail and QR stock pages pass NEXT_PUBLIC_APP_URL ✅
- get-local-ip.js works ✅
- dev:lan script binds to 0.0.0.0 ✅
- KNOWLEDGE.md documents workflow ✅

## Requirement Outcomes

Not provided.

## Deviations

None.

## Follow-ups

- Prod: set NEXT_PUBLIC_APP_URL=https://brol.app in production env
- App mobile: intercept QR scan and navigate in-app instead of opening browser
