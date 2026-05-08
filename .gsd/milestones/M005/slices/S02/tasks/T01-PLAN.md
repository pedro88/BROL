---
estimated_steps: 1
estimated_files: 3
skills_used: []
---

# T01: Identifier les endpoints tRPC pour les stats

Vérifier que les routers tRPC exposent des count ou list endpoints utilisables pour les stats : objects.list, contacts.list, loans.list. Lire les routers et les types shared si nécessaire.

## Inputs

- `Routers existants`

## Expected Output

- `Liste des endpoints disponibles pour les stats`

## Verification

grep -n 'list\|count\|stats' packages/api/src/routers/*.ts

## Observability Impact

Aucun — lecture seule.
