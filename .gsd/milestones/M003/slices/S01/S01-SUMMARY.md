---
id: S01
parent: M003
milestone: M003
provides:
  - S02 et S03 sont obsolètes: S02 (password verification) = intégré dans BetterAuth /sign-in/email, S03 (migration NULL hashedPassword) = champ supprimé
requires:
  - slice: M002/S01
    provides: BetterAuth emailAndPassword configuré
affects:
  - M003/S02 (qui teste le sign-in, déjà vérifié)
key_files:
  - packages/db/prisma/schema.prisma
  - packages/api/src/auth.ts
key_decisions:
  - User.hashedPassword supprimé — BetterAuth stocke le hash dans Account.password (scrypt, format salt:key)
  - User.avatarUrl → User.image (standard BetterAuth)
  - Account.expiresAt → Account.accessTokenExpiresAt (BA v1.6)
  - Account.tokenType + sessionState supprimés (pas utilisés par BA)
  - Password hashing = scrypt via BetterAuth (pas bcrypt)
patterns_established:
  - User.image au lieu de User.avatarUrl (standard BA)
  - Account.password pour credentials au lieu de User.hashedPassword
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M003/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M003/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M003/slices/S01/tasks/T03-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-05-04T08:30:47.684Z
blocker_discovered: false
---

# S01: Password hashing on signup

**Schema aligné, password hashé, 60 tests passent**

## What Happened

Alignement du schema User + Account avec BetterAuth v1.6. Suppression de User.hashedPassword (BA ne l'utilise pas), rename avatarUrl → image, alignement des champs Account (accessTokenExpiresAt, refreshTokenExpiresAt). Tous les selects tRPC ont été mis à jour. Sign-up et sign-in fonctionnent end-to-end, Account.password contient le hash scrypt.

## Verification

60 vitest tests passent, sign-up → Account.password non-NULL, sign-in → token, sign-in bad password → 401

## Requirements Advanced

None.

## Requirements Validated

- R003 — Sign-up → Account.password = scrypt hash, sign-in → token. 60 tests passent.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

S02 et S03 ne sont plus applicables: (1) S02 sign-in verification = déjà intégré dans BetterAuth (testé manuellement), pas de code additionnel à écrire. (2) S03: User.hashedPassword a été supprimé du schema (BetterAuth stocke dans Account.password), plus de users avec hashedPassword=NULL à migrer.

## Known Limitations

None.

## Follow-ups

["M004: Public QR scan — endpoint public pour scanner un QR et voir l'objet (routeur qr.getByCode)", "M005: Loans full loop — contact creation + reminder emails"]

## Files Created/Modified

- `packages/db/prisma/schema.prisma: User.image (ex-avatarUrl), remove hashedPassword; Account.align on BA fields` — 
- `packages/api/src/auth.ts: avatarUrl → image` — 
- `packages/api/src/routers/loans.ts: avatarUrl → image (select)` — 
- `packages/api/src/routers/collections.ts: avatarUrl → image` — 
- `packages/api/src/routers/objects.ts: avatarUrl → image` — 
- `packages/shared/src/schemas/index.ts: avatarUrl → image` — 
- `packages/shared/src/types/index.ts: avatarUrl → image` — 
- `apps/web/src/app/collections/[id]/page.tsx: type annotation avatarUrl → image` — 
