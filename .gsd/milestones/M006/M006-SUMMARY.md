---
id: M006
title: "QR Codes — stock, assignation et affichage"
status: complete
completed_at: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
---

# M006: QR Codes — stock, assignation et affichage

**Status:** ✅ Complete

## Summary

L'utilisateur peut générer un stock de QR codes vierges, les assigner à des objets physiques, et télécharger/imprimer chaque QR. La boucle est complète : scan → identification → prêt.

## Slices delivered

| Slice | Description | Status |
|---|---|---|
| S01 | Stock QR — génération, liste, suppression | ✅ |
| S02 | Assignation QR → Objet | ✅ |
| S03 | Affichage et download QR | ✅ |
| S04 | Tests unitaires et E2E | ✅ |

## Key decisions

- UUID v7 pour les codes QR — sortable et unique
- `qrcode` lib côté client pour la génération PNG
- Transaction DB sur l'assignation pour éviter les race conditions
- Page `/qr/[code]` publique pour le scan externe

## Key files
- `packages/api/src/routers/qr.ts`
- `apps/web/src/app/qr/page.tsx`
- `apps/web/src/app/qr/[code]/page.tsx`
- `apps/web/src/app/objects/[id]/page.tsx`

## Proof
- 16 tests unitaires QR passent
- Playwright E2E qr.spec.ts passe (auth-dependent skipped)
- Flow complet testable en browser: générer → assigner → afficher → download
