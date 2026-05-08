---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T02: Vérifier que l'API démarre sans erreur et que les endpoints répondent

Redémarrer le serveur API. Vérifier que /api/trpc/health.check fonctionne (publicProcedure). Vérifier que /api/trpc/collections.list retourne 401 sans Bearer token (comportement attendu).

## Inputs

- `packages/api/src/auth.ts (fixed)`

## Expected Output

- `API server running and verified`

## Verification

curl http://localhost:3001/api/trpc/health.check → JSON response ; curl http://localhost:3001/api/trpc/collections.list → 401 UNAUTHORIZED
