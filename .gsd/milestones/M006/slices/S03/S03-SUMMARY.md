---
id: S03
title: "Affichage et download QR"
status: complete
---

# S03: Affichage et download QR

**Status:** ✅ Complete

## What was done

- Affichage du QR code sur la page détail objet (via `qrcode` lib)
- Bouton Télécharger (PNG) et Imprimer
- Page `/qr/[code]` publique —扫描 QR → affiche les infos de l'objet
- Export batch ZIP depuis la page de gestion `/qr`
- QR code visible dans la liste `/qr` avec image générée

## Key files
- `apps/web/src/app/qr/page.tsx` (batch download ZIP)
- `apps/web/src/app/qr/[code]/page.tsx` (public scan page)
- `apps/web/src/app/objects/[id]/page.tsx` (QR display)

## Proof
E2E: `/qr` renders, QR codes visible avec images. `/qr/[code]` accessible sans auth.
