---
id: S03
parent: M002
milestone: M002
provides:
  - Bearer token auth vérifié end-to-end
  - Confirmation: pas de mock data dans le frontend
requires:
  - slice: S01: BetterAuth configuré, sessions en DB, nanostores
    provides: 
affects:
  []
key_files:
  - (none)
key_decisions:
  - Bearer token auth utilise Prisma session.token (pas sessionToken)
  - Sign-up/sign-in retournent token à la racine, pas dans session
  - AuthSessionSyncer doit couvrir les deux formats (session.token et token racine)
patterns_established:
  - Format de réponse BetterAuth: {token, user} à la racine pour sign-up/sign-in
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M002/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M002/slices/S03/tasks/T02-SUMMARY.md
  - .gsd/milestones/M002/slices/S03/tasks/T03-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-05-04T07:22:31.635Z
blocker_discovered: false
---

# S03: Mock data → real tRPC queries

**Intégration vérifiée — auth Bearer token fonctionnel, pas de mock data**

## What Happened

S03 était un toilettage d'intégration. Aucune page ne contenait de mock data — le frontend utilisait déjà du vrai tRPC. Les bugs découverts: (1) auth.ts utilisait sessionToken/expires au lieu de token/expiresAt, (2) AuthSessionSyncer ne lisait pas le bon chemin pour le token (data.session.token vs data.token). Tests end-to-end confirment le flow sign-up → Bearer token → protected query fonctionnel.

## Verification

Toutes les 3 tâches T01-T03 complètes. API server fonctionnel. Flow auth sign-up → Bearer token → protected query vérifié.

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

["Les tsconfig errors ne sont toujours pas résolues — le build TypeScript échoue (tsx fonctionne en dev mais pas npm run build)"]

## Follow-ups

["S04: tests unitaires sur les routers tRPC", "Les tsconfig errors dans packages/api sont toujours présentes — le build ne passe pas avec tsc (fonctionne avec tsx)"]

## Files Created/Modified

- `packages/api/src/auth.ts` — sessionToken→token, expires→expiresAt, type emailVerified
- `apps/web/src/lib/auth-session-syncer.tsx` — lecture token à la racine
