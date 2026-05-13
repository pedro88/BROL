---
estimated_steps: 4
estimated_files: 1
skills_used: []
---

# T05: Corriger section Prêts récents + cards cliquables

1. Renommer "// RETOURS RECENTS" → "// PRÊTS RÉCENTS"
2. Dans les cards : remplacer juste object.name par [object.name] + [contact borrower name] + [date retour]
3. Wrap les cards dans Link vers /objects/[id]
4. La requête loansQuery.lentOut donne déjà tout (object, borrower, returnDueDate)

## Inputs

- `apps/web/src/app/page.tsx`

## Expected Output

- `apps/web/src/app/page.tsx`

## Verification

git diff --stat

## Observability Impact

Aucun
