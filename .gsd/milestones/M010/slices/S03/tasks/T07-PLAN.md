---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T07: Ajouter -H 0.0.0.0 au script dev

Modifier apps/web/package.json pour ajouter `dev` script qui exécute `next dev -H 0.0.0.0`. Ajouter une entrée `default` qui exécute `next dev` sans le -H pour ne pas changer le comportement par défaut des autres devs.

## Inputs

- `apps/web/package.json`

## Expected Output

- `apps/web/package.json modifié`

## Verification

grep -A3 '"dev"' apps/web/package.json
