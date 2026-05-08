---
estimated_steps: 4
estimated_files: 3
skills_used: []
---

# T01: Unifier BETTER_AUTH_SECRET entre les 2 instances

1. Unifier BETTER_AUTH_SECRET dans tous les .env : apps/web/.env.local doit avoir le même que .env racine (32144Flush+)
2. Vérifier que packages/api/.env include aussi le même secret
3. Supprimer le placeholder 'your-secret-key-here-min-32-chars' de apps/web/.env.local
4. Vérifier DATABASE_URL cohérent partout

## Inputs

- `Diagnostic précédent : secrets différents entre les instances`

## Expected Output

- `apps/web/.env.local avec BETTER_AUTH_SECRET unifié`
- `.env cohérent`

## Verification

grep BETTER_AUTH_SECRET apps/web/.env.local .env packages/api/.env → mêmes valeurs
