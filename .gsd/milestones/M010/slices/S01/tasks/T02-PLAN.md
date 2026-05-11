---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T02: useQrDownload encode aussi l'URL complète

Modifier `downloadPng` et `printQr` dans `useQrDownload` pour qu'ils encodent aussi l'URL complète (même logique que QrCodeImage).

## Inputs

- `qr-code-image.tsx`

## Expected Output

- `apps/web/src/components/qr/qr-code-image.tsx modifié`

## Verification

grep -n 'downloadPng\|printQr' apps/web/src/components/qr/qr-code-image.tsx
