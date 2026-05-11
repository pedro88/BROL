---
id: S01
title: "Stock QR — génération, liste, suppression"
status: complete
---

# S01: Stock QR — génération, liste, suppression

**Status:** ✅ Complete

## What was done

- Page `/qr` avec structure et layout VHS theme
- `qr.listStock` — liste les QR codes avec pagination
- `qr.generateStock(count)` — génère N codes UUID v7 vierges
- `qr.deleteStock(id)` — supprime un code non assigné
- Taux de couverture: 100% sur le routeur QR

## Key files
- `apps/web/src/app/qr/page.tsx`
- `packages/api/src/routers/qr.ts`

## Proof
Tests unitaires: 16 passent. E2E: qr.spec.ts passes (auth-dependent tests skipped).
