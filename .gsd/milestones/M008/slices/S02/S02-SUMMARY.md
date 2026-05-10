---
id: S02
parent: M008
milestone: M008
provides:
  - (none)
requires:
  []
affects:
  []
key_files:
  - (none)
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
completed_at: 2026-05-10T13:54:41.821Z
blocker_discovered: false
---

# S02: loans.create — graceful error on missing borrower

**loans.create: TRPCError structured errors, contact-aware borrower lookup**

## What Happened

S02/T01 : loans.create — tous les throw new Error() convertis en TRPCError avec codes appropriés. Ajout d'une lookup Contact quand borrower non trouvé (pour différencier contact sans account vs ID invalide). TRPCError ré-exporté depuis trpc/index.ts.

## Verification

tsc @brol/api: 0 erreur loans.ts. Le code utilise TRPCError au lieu de throw Error().

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

Néant.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

- `packages/api/src/routers/loans.ts` — Converted 3 throw Error() → TRPCError({code, message}), added contact-aware borrower lookup with actionable error
- `packages/api/src/trpc/index.ts` — Re-exported TRPCError from @trpc/server
