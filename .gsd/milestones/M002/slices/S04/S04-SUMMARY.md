---
id: S04
title: "Tests unitaires routers tRPC"
status: complete
---

# S04: Tests unitaires routers tRPC

**Status:** ✅ Complete

## What was done

- 74 tests unitaires Vitest sur les 5 routers (collections, objects, loans, contacts, qr)
- 100% line/branch coverage sur les routers principaux
- Tests d'auth: protectedProcedure throws UNAUTHORIZED sans session
- Tests de validation: erreurs Zod sur inputs invalides

## Key files
- `packages/api/src/routers/__tests__/*.test.ts`

## Proof
```
Test Files  5 passed (5)
     Tests  74 passed (74)
```
