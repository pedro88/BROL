---
estimated_steps: 10
estimated_files: 3
skills_used: []
---

# T01: Photo dans formulaire objet (coverImage URL + PhotoCapture sur edit)

Intégrer la capture photo dans le formulaire objet.

**Problème:** PhotoCapture nécessite objectId (pour presigned URL S3), mais l'objet n'existe pas encore.

**Solution:** Flow en 2 étapes — (A) créer l'objet d'abord avec un champ coverImage URL optionnel, (B) rediriger vers /objects/[id]/edit après création pour ajouter des photos via PhotoCapture.

**Étapes:**
1. Ajouter un champ `coverImageUrl` dans le formulaire ObjectForm (input URL simple)
2. Mapper coverImageUrl → champ coverImage dans le schema Zod/create tRPC
3. Après création réussie, redirect vers `/objects/${data.id}/edit` au lieu de `/collections/${data.collectionId}`
4. Ajouter PhotoCapture sur la page /objects/[id]/edit (qui existe déjà)
5. Vérifier que la page edit objet intègre PhotoCapture et affiche les photos existantes

**Note:** Si les credentials S3 ne sont pas configurés, le champ coverImageUrl reste fonctionnel (URL externe). PhotoCapture sera actif quand S3 le sera.

## Inputs

- `apps/web/src/components/objects/object-form.tsx`
- `apps/web/src/components/photos/photo-capture.tsx`
- `apps/web/src/app/objects/[id]/edit/page.tsx`

## Expected Output

- `apps/web/src/components/objects/object-form.tsx`
- `apps/web/src/app/objects/[id]/edit/page.tsx`
- `packages/api/src/routers/objects.ts (optionnel si schema change)`

## Verification

git diff --stat && vérifier que /objects/add crée un objet et redirige vers /objects/[id]/edit, et que la page edit affiche PhotoCapture

## Observability Impact

Aucun
