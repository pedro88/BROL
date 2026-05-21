---
estimated_steps: 5
estimated_files: 1
skills_used: []
---

# T04: Dépendances tRPC

Installer les dépendances tRPC React Query si pas déjà là:
- @trpc/react-query
- @tanstack/react-query
- @brol/shared (pour les types Zod)
Verifier que @tanstack/react-query est compatible React 18 (actuellement v5.62.8)

## Inputs

- None specified.

## Expected Output

- `apps/mobile/package.json (mis à jour)`

## Verification

pnpm install dans apps/mobile + tsc --noEmit

## Observability Impact

Aucune
