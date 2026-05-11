---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T03: Passer baseUrl dans la page détail objet

Dans apps/web/src/app/objects/[id]/page.tsx, passer baseUrl={process.env.NEXT_PUBLIC_APP_URL} à QrCodeImage et aux fonctions de download/print.

## Inputs

- `objects/[id]/page.tsx`

## Expected Output

- `apps/web/src/app/objects/[id]/page.tsx modifié`

## Verification

grep -n 'baseUrl' apps/web/src/app/objects/[id]/page.tsx
