---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T08: Intégrer galerie photo dans la page détail objet

Construire le panneau de gestion des photos sur la page détail objet. Affiche les photos en grille (3 colonnes), chaque photo avec bouton supprimer (icône X). Bouton Ajouter une photo qui ouvre PhotoCaptureDialog. Utilise trpc.objects.get.include (lorsque dispo) ou trpc.photos.list pour charger les photos. Invalide le cache après ajout/suppression.

## Inputs

- `apps/web/src/components/photos/photo-capture.tsx`

## Expected Output

- `apps/web/src/components/photos/photo-gallery.tsx`
- `apps/web/src/app/objects/[id]/page.tsx mis à jour`

## Verification

Page objet affiche la galerie photo avec les photos existantes
