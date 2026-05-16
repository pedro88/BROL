# S02: Sign-in screen

**Goal:** Écran sign-in qui appelle BetterAuth /api/auth/sign-in/email et stocke le token
**Demo:** Un user peut saisir email + password et se connecter, voir son dashboard

## Must-Haves

- ## Success Criteria
- `app/sign-in.tsx` render un formulaire email + password
- Appelle `/api/auth/sign-in/email` via fetch
- Stocke le sessionToken dans secure storage
- Affiche erreur si credentials invalides
- Redirect vers /home si succès

## Proof Level

- This slice proves: User peut se connecter avec credentials valides, erreur si invalides

## Integration Closure

S02 produit un sign-in fonctionnel qui sera consommé par S04 (auth state).

## Verification

- Erreurs d'auth loggées (invalid credentials, network error)

## Tasks

- [ ] **T01: Auth client (sign-in API calls)** `est:30min`
  Créer apps/mobile/src/lib/auth-client.ts
  - signInEmailPassword(email, password): POST /api/auth/sign-in/email
  - signUpEmailPassword(email, password, name): POST /api/auth/sign-up/email
  - signOut(): POST /api/auth/sign-out
  - getSession(): GET /api/auth/get-session
  - Retourne { session, user } depuis BetterAuth
  - Note: Le sessionId dans la réponse est le raw token à stocker
  - Files: `apps/mobile/src/lib/auth-client.ts`
  - Verify: tsc --noEmit

- [ ] **T02: Sign-in screen UI** `est:1h`
  Creer apps/mobile/app/sign-in.tsx
  - Layout: Stack (car pas dans tabs)
  - Champs: email (TextInput) + password (TextInput secure)
  - Bouton submit appelle signInEmailPassword
  - En succès: stocke token (placeholder pour l'instant, S04 le fait vraiment)
  - En erreur: affiche le message d'erreur (email/password incorrect)
  - Lien vers /sign-up si pas de compte
  - Style: thème VHS 80s (colors.primary, border, glow)
  - Files: `apps/mobile/app/sign-in.tsx`
  - Verify: L'écran affiche le formulaire et répond aux erreurs de validation

- [ ] **T03: Sign-in integration test** `est:20min`
  Tester manuellement le sign-in:
  - Lancer l'app mobile (ou expo start --web)
  - Naviguer vers /sign-in
  - Taper des credentials invalides → vérifier message d'erreur
  - Taper des credentials valides → vérifier redirect vers /home
  Note: Si l'API n'est pas accessible (CORS ou network), vérifier que l'erreur réseau est affichée
  - Verify: Test manuel avec credentials réel ou de test

## Files Likely Touched

- apps/mobile/src/lib/auth-client.ts
- apps/mobile/app/sign-in.tsx
