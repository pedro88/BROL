---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T03: Créer page /browse

Créer page /browse pour lister les collections publiques. Utilise trpc.collections.listPublic.useQuery(). Grid responsive.

## Inputs

- `packages/api/src/routers/collections.ts`

## Expected Output

- `apps/web/src/app/browse/page.tsx`

## Verification

curl -o /dev/null -w '%{http_code}' http://localhost:3000/browse
