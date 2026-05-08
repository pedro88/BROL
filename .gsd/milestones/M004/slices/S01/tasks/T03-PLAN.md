---
estimated_steps: 5
estimated_files: 2
skills_used: []
---

# T03: Run de vérification E2E — valider la cause racine

1. Lancer les E2E avec les 2 serveurs configurés
2. Courir un subset de tests auth (ex: toggle, form validation, browse)
3. Vérifier si createUserAPI fonctionne (token retourné)
4. Vérifier si sign-in/sign-up UI fonctionnent
5. Documenter les résultats

## Inputs

- `T01 (secret unifié)`
- `T02 (double webServer)`

## Expected Output

- `Résultats E2E pour S01`
- `Décision sur les causes restantes`

## Verification

npx playwright test --reporter=line apps/web/e2e/auth.spec.ts
