---
id: S02
title: "Assignation QR → Objet"
status: complete
---

# S02: Assignation QR → Objet

**Status:** ✅ Complete

## What was done

- `qr.assignToObject({ code, objectId })` — lie un QR à un objet
- Assign QR dialog accessible depuis la page détail objet
- Formulaire de création d'objet : sélecteur de QR disponible
- Transaction DB pour éviter les race conditions

## Key files
- `packages/api/src/routers/qr.ts` (assignToObject)
- `apps/web/src/app/objects/[id]/edit/page.tsx` (assign dialog)
- `apps/web/src/app/objects/add/page.tsx` (QR select)

## Proof
Tests unitaires passent. E2E: objet avec QR visible dans la liste.
