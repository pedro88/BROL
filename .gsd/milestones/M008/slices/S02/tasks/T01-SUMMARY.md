---
id: T01
parent: S02
milestone: M008
key_files:
  - packages/api/src/routers/loans.ts
key_decisions:
  - Changed 3 throw new Error() to TRPCError with proper codes: NOT_FOUND, CONFLICT
  - Added Contact lookup when borrower not found — returns actionable error for contacts without accounts
duration: 
verification_result: untested
completed_at: 2026-05-10T13:54:34.065Z
blocker_discovered: false
---

# T01: loans.create: TRPCError structured errors, contact-aware borrower lookup

**loans.create: TRPCError structured errors, contact-aware borrower lookup**

## What Happened

S02/T01 : loans.create — tous les throw new Error() convertis en TRPCError avec codes appropriés (NOT_FOUND pour objet/emprunteur introuvable, CONFLICT pour prêt déjà actif). Ajout d'une lookup Contact quand borrower non trouvé pour différencier le cas "contact sans account" du cas "ID invalide".

## Verification

tsc @brol/api: 0 erreur sur loans.ts. Le code utilise TRPCError avec codes NOT_FOUND/CONFLICT au lieu de throw Error()

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/api/src/routers/loans.ts`
