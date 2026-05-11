---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T04: Passer baseUrl dans la page QR stock

Dans apps/web/src/app/qr/page.tsx, passer baseUrl={process.env.NEXT_PUBLIC_APP_URL} à QrCodeImage pour le rendu des QR dans la liste de stock.

## Inputs

- `qr/page.tsx`

## Expected Output

- `apps/web/src/app/qr/page.tsx modifié`

## Verification

grep -n 'baseUrl' apps/web/src/app/qr/page.tsx
