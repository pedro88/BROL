---
id: T01
parent: S01
milestone: M008
key_files:
  - apps/web/src/app/sign-in/page.tsx
  - packages/api/src/trpc/index.ts
key_decisions:
  - Password strength: 4 levels (short/weak/fair/strong) based on length + charset
  - TRPCError re-exported from trpc/index.ts
  - signInEmailPassword/signUpEmailPassword take 2/3 args only, callbackUrl removed from callers
duration: 
verification_result: untested
completed_at: 2026-05-10T13:54:14.015Z
blocker_discovered: false
---

# T01: Sign-up password UX: confirmation, toggle visibility, strength indicator, client-side validation

**Sign-up password UX: confirmation, toggle visibility, strength indicator, client-side validation**

## What Happened

T01 : ajout de passwordConfirm + show/hide toggle + indicateur de force + validation côté client. Strength indicator = barre colorée + texte. Mismatch error affichée avant submit. TRPCError exporté depuis trpc/index.ts pour usage dans les routers. Fix erreurs TS sur signInEmailPassword/signUpEmailPassword (API prend 2/3 args sans callbackUrl).

## Verification

tsc @brol/api: 0 erreur sur loans.ts. Browser: indicateur "Fort" visible (barre 100% + texte vert), error "Les mots de passe ne correspondent pas" visible, toggle visibilité fonctionnel.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/app/sign-in/page.tsx`
- `packages/api/src/trpc/index.ts`
