---
estimated_steps: 5
estimated_files: 1
skills_used: []
---

# T01: search param sur contacts.list API

Ajouter le support de recherche sur le endpoint contacts.list.

**Étapes:**
1. Modifier `contactsRouter.list` pour accepter un paramètre `search?: string` optionnel
2. Ajouter un where clause Prisma: `name` contains search (mode insensitive) OU `email` contains search
3. Garder la compatibilité backwards — si search non fourni, comportement identical

## Inputs

- `packages/api/src/routers/contacts.ts`

## Expected Output

- `packages/api/src/routers/contacts.ts`

## Verification

git diff --stat + test que contacts.list avec search filtre correctement

## Observability Impact

Aucun
