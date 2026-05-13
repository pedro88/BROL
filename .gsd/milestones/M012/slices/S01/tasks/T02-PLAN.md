---
estimated_steps: 6
estimated_files: 2
skills_used: []
---

# T02: Créer page /objects avec tableau filtrable

1. Créer /apps/web/src/app/objects/page.tsx
2. Requête trpc.objects.all (ou adapter list pour lister TOUS les objets toutes collections)
3. Tableau HTML simple : colonnes = nom, collection, état, status
4. Filtres : select collection + select état + select status (prêté/emprunté/retourné)
5. Filtres pilotés par URL params (?collectionId=X&status=Y) pour bookmarkabilité
6. Lien sur le nom de l'objet → /objects/[id]

## Inputs

- `apps/web/src/app/page.tsx`
- `apps/web/src/app/loans/page.tsx`

## Expected Output

- `apps/web/src/app/objects/page.tsx`
- `packages/api/src/routers/objects.ts (optionnel)`

## Verification

git diff --stat + vérification navigateur

## Observability Impact

Aucun
