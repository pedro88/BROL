---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T05: Documenter NEXT_PUBLIC_APP_URL dans .env.example

Ajouter dans .env.example une section "QR Codes" documentant NEXT_PUBLIC_APP_URL et son utilisation pour les QR codes.

## Inputs

- `.env.example`

## Expected Output

- `.env.example mis à jour`

## Verification

grep -A2 'QR' .env.example
