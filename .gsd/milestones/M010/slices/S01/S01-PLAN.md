# S01: QR encodes full URL via NEXT_PUBLIC_QR_BASE_URL

**Goal:** QrCodeImage encode une URL complète `${NEXT_PUBLIC_APP_URL}/qr/${code}` au lieu du code brut, permettant au scanner du téléphone d'ouvrir directement la page.
**Demo:** QR codes embed `NEXT_PUBLIC_QR_BASE_URL/qr/CODE` — phones can open it directly.

## Must-Haves

- QrCodeImage accepte un prop optionnel `baseUrl` (string | undefined)\n- Quand `baseUrl` est fourni, le QR encode `{baseUrl}/qr/{code}`\n- Quand `baseUrl` est absent, le QR encode le code brut (pas de régression)\n- useQrDownload encode aussi l'URL complète\n- La page détail objet et la page stock QR passent `process.env.NEXT_PUBLIC_APP_URL` comme baseUrl

## Proof Level

- This slice proves: e2e: navigate to object with QR, inspect img src attribute, verify it encodes full URL

## Integration Closure

Aucun changement backend. API tRPC inchangée.

## Verification

- Aucun.

## Tasks

- [x] **T01: Modifier QrCodeImage pour accepter baseUrl et encoder l'URL complète** `est:15min`
  Ajouter un prop optionnel `baseUrl?: string` au composant `QrCodeImage`. Modifier `QRCode.toDataURL` et `QRCode.toCanvas` pour encoder `{baseUrl}/qr/{code}` quand baseUrl est fourni, sinon le code brut.
  - Files: `apps/web/src/components/qr/qr-code-image.tsx`
  - Verify: grep -n 'baseUrl' apps/web/src/components/qr/qr-code-image.tsx

- [x] **T02: useQrDownload encode aussi l'URL complète** `est:10min`
  Modifier `downloadPng` et `printQr` dans `useQrDownload` pour qu'ils encodent aussi l'URL complète (même logique que QrCodeImage).
  - Files: `apps/web/src/components/qr/qr-code-image.tsx`
  - Verify: grep -n 'downloadPng\|printQr' apps/web/src/components/qr/qr-code-image.tsx

- [x] **T03: Passer baseUrl dans la page détail objet** `est:10min`
  Dans apps/web/src/app/objects/[id]/page.tsx, passer baseUrl={process.env.NEXT_PUBLIC_APP_URL} à QrCodeImage et aux fonctions de download/print.
  - Files: `apps/web/src/app/objects/[id]/page.tsx`
  - Verify: grep -n 'baseUrl' apps/web/src/app/objects/[id]/page.tsx

- [x] **T04: Passer baseUrl dans la page QR stock** `est:10min`
  Dans apps/web/src/app/qr/page.tsx, passer baseUrl={process.env.NEXT_PUBLIC_APP_URL} à QrCodeImage pour le rendu des QR dans la liste de stock.
  - Files: `apps/web/src/app/qr/page.tsx`
  - Verify: grep -n 'baseUrl' apps/web/src/app/qr/page.tsx

- [x] **T05: Documenter NEXT_PUBLIC_APP_URL dans .env.example** `est:5min`
  Ajouter dans .env.example une section "QR Codes" documentant NEXT_PUBLIC_APP_URL et son utilisation pour les QR codes.
  - Files: `.env.example`
  - Verify: grep -A2 'QR' .env.example

## Files Likely Touched

- apps/web/src/components/qr/qr-code-image.tsx
- apps/web/src/app/objects/[id]/page.tsx
- apps/web/src/app/qr/page.tsx
- .env.example
