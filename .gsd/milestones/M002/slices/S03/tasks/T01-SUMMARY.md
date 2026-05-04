---
id: T01
parent: S03
milestone: M002
key_files:
  - packages/api/src/auth.ts
key_decisions:
  - where: { token } (pas sessionToken) — correspond au schéma Prisma
  - expiresAt au lieu de expires — соответствует Prisma schema
  - emailVerified: boolean | null (pas Date | null) — correspond au type Boolean du schéma
duration: 
verification_result: passed
completed_at: 2026-05-04T07:21:30.034Z
blocker_discovered: false
---

# T01: Fix sessionToken→token + expires→expiresAt dans getSession()

**Fix sessionToken→token + expires→expiresAt dans getSession()**

## What Happened

Trois bugs corrigés dans getSession(): (1) Prisma query cherchait sessionToken au lieu de token, (2) expiration comparée à dbSession.expires au lieu de dbSession.expiresAt, (3) dbSession.sessionToken utilisé au lieu de dbSession.token. Ces bugs auraient causé une exception Prisma à chaque requête Bearer token. Également corrigé le type emailVerified de Date | null à boolean | null pour correspondre au schéma.

## Verification

grep "where: { token }" packages/api/src/auth.ts → présent ✓

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -n 'where: { token }' packages/api/src/auth.ts` | 0 | ✅ pass | 0ms |

## Deviations

Le fix original planifiait aussi la correction du type emailVerified (Boolean vs Date) + l'ajout de include: { user: true }. include était déjà présent — non modifié. emailVerified corrigé en boolean | null.

## Known Issues

Le champ emailVerified dans le schéma est Boolean mais le type BetterAuthSession le déclare Date | null — aligné dans cette correction.

## Files Created/Modified

- `packages/api/src/auth.ts`
