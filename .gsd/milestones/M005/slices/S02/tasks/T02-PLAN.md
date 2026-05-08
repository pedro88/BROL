---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T02: Remplacer les données mock par des hooks tRPC

Rendre page.tsx client-side ('use client'). Remplacer les valeurs codées en dur par des appels trpc.objects.list, trpc.contacts.list, trpc.loans.list. Ajouter des loading skeletons et empty states. Gérer les erreurs avec un fallback.

## Inputs

- `Endoints identifiés en T01`
- `trpc provider`

## Expected Output

- `apps/web/src/app/page.tsx avec données réelles`

## Verification

grep -n 'useQuery\|trpc\.\|useState' apps/web/src/app/page.tsx && ! grep "'24'\|'3'\|'12'" apps/web/src/app/page.tsx

## Observability Impact

Loading + error states visibles.
