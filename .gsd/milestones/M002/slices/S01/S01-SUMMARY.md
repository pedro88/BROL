---
id: S01
title: "Auth BetterAuth + OAuth"
status: complete
---

# S01: Auth BetterAuth + OAuth

**Status:** ✅ Complete

## What was done

- `packages/api/src/auth.ts` — BetterAuth instance avec `emailAndPassword` enabled, session cookie HTTP-only 7j
- `createContext` lit le userId depuis `auth.api.getSession({ headers })` — plus de null
- Schema Prisma aligné avec BetterAuth v1.6: Account, Session, VerificationToken
- OAuth (Google/GitHub/Apple) commenté — credentials non-configurés
- `protectedProcedure` fonctionne avec userId réel
- Sign-in/sign-up via `/api/auth/*` endpoints
- Test: 74 unit tests passent

## Key files
- `packages/api/src/auth.ts`
- `packages/api/src/trpc/index.ts`
- `packages/db/prisma/schema.prisma`

## Proof
Unit tests API: 74/74 passent.
