---
estimated_steps: 9
estimated_files: 1
skills_used: []
---

# T01: Sign-up screen UI

Creer apps/mobile/app/sign-up.tsx
- Layout: Stack (car pas dans tabs)
- Champs: name (TextInput) + email (TextInput) + password (TextInput secure)
- Validation: email format, password min 8 chars, name non vide
- Bouton submit appelle signUpEmailPassword
- En succès: stocke token
- En erreur: affiche le message (email déjà pris, mot de passe trop faible)
- Lien vers /sign-in si déjà un compte
- Style: thème VHS 80s identique au sign-in

## Inputs

- `apps/mobile/src/lib/auth-client.ts`
- `apps/mobile/src/theme/index.ts`

## Expected Output

- `apps/mobile/app/sign-up.tsx`

## Verification

L'écran affiche le formulaire, valide les champs, et affiche les erreurs

## Observability Impact

Échec de création de compte visible (erreur displayed on screen)
