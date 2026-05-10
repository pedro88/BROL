---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T03: Test end-to-end loan creation flow

Vérifier que le prêt créé apparaît bien dans /loans (prêtés tab)

## Inputs

- `apps/web/src/app/loans/page.tsx`

## Expected Output

- `Prêt visible après création`

## Verification

Créer un prêt → visible dans /loans

## Observability Impact

Invalidation query après création
