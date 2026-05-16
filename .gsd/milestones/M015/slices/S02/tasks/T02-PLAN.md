---
estimated_steps: 8
estimated_files: 1
skills_used: []
---

# T02: Sign-in screen UI

Creer apps/mobile/app/sign-in.tsx
- Layout: Stack (car pas dans tabs)
- Champs: email (TextInput) + password (TextInput secure)
- Bouton submit appelle signInEmailPassword
- En succès: stocke token (placeholder pour l'instant, S04 le fait vraiment)
- En erreur: affiche le message d'erreur (email/password incorrect)
- Lien vers /sign-up si pas de compte
- Style: thème VHS 80s (colors.primary, border, glow)

## Inputs

- `apps/mobile/src/lib/auth-client.ts`
- `apps/mobile/src/theme/index.ts`

## Expected Output

- `apps/mobile/app/sign-in.tsx`

## Verification

L'écran affiche le formulaire et répond aux erreurs de validation

## Observability Impact

Échec de connexion visible (erreur displayed on screen)
