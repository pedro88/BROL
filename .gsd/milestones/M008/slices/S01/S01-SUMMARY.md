---
id: S01
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
completed_at: 2026-05-10T13:54:26.526Z
blocker_discovered: false
---

# S01: Sign-up password UX + validation

**Sign-up password UX: confirmation, toggle visibility, strength indicator, client validation**

## What Happened

S01 exécuté. T01 : ajout de passwordConfirm + show/hide toggle + indicateur de force (4 niveaux) + validation côté client. Le mismatch error s'affiche avant submit. TRPCError exporté depuis trpc/index.ts pour les autres routers. Fix aussi les erreurs TS sur les appels signInEmailPassword/signUpEmailPassword (API prend 2/3 args, callbackUrl retiré).

## Verification

tsc @brol/api: 0 erreur loans.ts. Browser: barre "Fort" visible après "TestPass123!", erreur mismatch visible, toggle visibility fonctionnel.

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

Les erreurs TS pre-existantes (trustedOrigins auth.ts, tests) ne sont pas traitées — elles existaient avant M008.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

- `apps/web/src/app/sign-in/page.tsx` — Sign-up: password confirmation, strength bar, eye toggle, mismatch error, client-side validation
- `packages/api/src/trpc/index.ts` — Re-export TRPCError for router usage
