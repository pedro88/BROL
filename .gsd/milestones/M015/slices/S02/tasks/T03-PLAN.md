---
estimated_steps: 6
estimated_files: 1
skills_used: []
---

# T03: Sign-in integration test

Tester manuellement le sign-in:
- Lancer l'app mobile (ou expo start --web)
- Naviguer vers /sign-in
- Taper des credentials invalides → vérifier message d'erreur
- Taper des credentials valides → vérifier redirect vers /home
Note: Si l'API n'est pas accessible (CORS ou network), vérifier que l'erreur réseau est affichée

## Inputs

- None specified.

## Expected Output

- Update the implementation and proof artifacts needed for this task.

## Verification

Test manuel avec credentials réel ou de test

## Observability Impact

Aucune
