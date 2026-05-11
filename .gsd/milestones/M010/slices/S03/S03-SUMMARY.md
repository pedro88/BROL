---
id: S03
parent: M010
milestone: M010
provides:
  - dev:lan npm script for LAN-bound dev server
  - KNOWLEDGE.md section on QR local testing workflow
requires:
  []
affects:
  []
key_files:
  - apps/web/package.json
  - .gsd/KNOWLEDGE.md
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
completed_at: 2026-05-11T12:46:43.508Z
blocker_discovered: false
---

# S03: Dev server starts on LAN IP

**dev:lan script added and QR workflow documented in KNOWLEDGE.md**

## What Happened

Added dev:lan npm script that binds Next.js to 0.0.0.0, enabling LAN access. Added documentation section in KNOWLEDGE.md covering the full QR testing workflow.

## Verification

grep -A1 'dev:lan' apps/web/package.json && grep -i 'qr' .gsd/KNOWLEDGE.md

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
