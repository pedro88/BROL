---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T03: Créer router photos

Ajouter les procédures tRPC : photo.add (url + position, protège que l'objet appartient à l'user), photo.remove (protège ownership), photo.list (url, position, createdAt). Créer packages/api/src/routers/photos.ts.

## Inputs

- `packages/api/src/lib/s3.ts`
- `packages/api/src/routers/objects.ts`

## Expected Output

- `packages/api/src/routers/photos.ts avec add/remove/list`
- `packages/api/src/router.ts mis à jour avec photosRouter`

## Verification

grep -r 'photo' packages/api/src/router.ts
