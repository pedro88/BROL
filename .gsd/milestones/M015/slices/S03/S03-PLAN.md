# S03: Sign-up screen

**Goal:** Écran sign-up qui appelle BetterAuth /api/auth/sign-up/email
**Demo:** Un user peut créer un compte avec email + password + name

## Must-Haves

- ## Success Criteria
- `app/sign-up.tsx` render un formulaire name + email + password
- Appelle `/api/auth/sign-up/email` via fetch
- Stocke le sessionToken dans secure storage
- Affiche erreur si email déjà pris
- Redirect vers /home si succès

## Proof Level

- This slice proves: User peut créer un compte, reçoit un sessionToken, et est redirigé vers /home

## Integration Closure

S03 produit un sign-up fonctionnel qui sera consommé par S04 (auth state).

## Verification

- Erreurs de création de compte loggées (email déjà pris, mot de passe trop faible)

## Tasks

- [ ] **T01: Sign-up screen UI** `est:1h`
  Creer apps/mobile/app/sign-up.tsx
  - Layout: Stack (car pas dans tabs)
  - Champs: name (TextInput) + email (TextInput) + password (TextInput secure)
  - Validation: email format, password min 8 chars, name non vide
  - Bouton submit appelle signUpEmailPassword
  - En succès: stocke token
  - En erreur: affiche le message (email déjà pris, mot de passe trop faible)
  - Lien vers /sign-in si déjà un compte
  - Style: thème VHS 80s identique au sign-in
  - Files: `apps/mobile/app/sign-up.tsx`
  - Verify: L'écran affiche le formulaire, valide les champs, et affiche les erreurs

- [ ] **T02: Sign-up integration test** `est:20min`
  Tester manuellement le sign-up:
  - Naviguer vers /sign-up
  - Tenter de créer un compte avec email déjà utilisé
  - Créer un compte avec credentials valides
  - Vérifier redirect vers /home après succès
  - Verify: Test manuel avec credentials de test

## Files Likely Touched

- apps/mobile/app/sign-up.tsx
