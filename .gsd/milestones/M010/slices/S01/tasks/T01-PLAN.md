---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T01: Modifier QrCodeImage pour accepter baseUrl et encoder l'URL complète

Ajouter un prop optionnel `baseUrl?: string` au composant `QrCodeImage`. Modifier `QRCode.toDataURL` et `QRCode.toCanvas` pour encoder `{baseUrl}/qr/{code}` quand baseUrl est fourni, sinon le code brut.

## Inputs

- `qr-code-image.tsx`
- `.env.example`

## Expected Output

- `apps/web/src/components/qr/qr-code-image.tsx modifié`

## Verification

grep -n 'baseUrl' apps/web/src/components/qr/qr-code-image.tsx
