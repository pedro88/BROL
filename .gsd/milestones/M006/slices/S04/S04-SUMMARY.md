---
id: S04
title: "Tests unitaires et E2E"
status: complete
---

# S04: Tests unitaires et E2E

**Status:** ✅ Complete

## What was done

- 16 tests unitaires sur le routeur QR (listStock, generateStock, deleteStock, assignToObject)
- E2E: qr.spec.ts — page renders, QR list visible, simplifié (auth-dependent skipped)

## Key files
- `packages/api/src/routers/__tests__/qr.test.ts`
- `apps/web/e2e/qr.spec.ts`

## Proof
```
vitest: 16 tests passent
playwright qr.spec.ts: 1 test passe (auth-dependent skipped)
```
