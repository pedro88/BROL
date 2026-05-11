---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T07: Créer composant PhotoCapture avec caméra et upload

Créer apps/web/src/components/photos/photo-capture.tsx. Props: objectId, onPhotoAdded(photo), onError. Fonctionnement: bouton qui ouvre un dialog avec 2 onglets (Appareil photo / Fichier) + intégration DuckDuckGo Images. L'input[type=file] utilise accept='image/*' capture='environment' pour caméra mobile. Preview de l'image sélectionnée avant upload. Upload via presigned URL (PUT request avec fetch). Appelle photos.getPresignedUrl → PUT vers uploadUrl → photos.add. Gestion d'erreur user-friendly.

## Inputs

- `apps/web/src/lib/trpc-hooks/photos.ts`

## Expected Output

- `apps/web/src/components/photos/photo-capture.tsx`
- `apps/web/src/components/photos/photo-capture-dialog.tsx`

## Verification

Composant importe sans erreur dans la page objet
