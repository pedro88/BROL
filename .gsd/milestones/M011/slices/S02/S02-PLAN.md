# S02: Composant capture/upload photo

**Goal:** Composant PhotoCapture réutilisable avec capture caméra mobile (input capture="environment"), upload fichier desktop/mobile, preview client-side, et integration DuckDuckGo Images.
**Demo:** Bouton qui ouvre caméra mobile ou sélecteur de fichier, preview de la photo avant envoi

## Must-Haves

- Composant PhotoCapture rendu dans la page objet sans erreur. Preview visible avant upload. Upload vers S3 fonctionnel (avec mock si pas de credentials). Photo sauvegardée en base et visible dans la liste.

## Proof Level

- This slice proves: Composant renders, la preview s'affiche, l'upload génère un appel POST vers presigned URL.

## Integration Closure

Composant PhotoCapture intégré dans la page détail objet (apps/web/src/app/objects/[id]/page.tsx) et la page edit (apps/web/src/app/objects/[id]/edit/page.tsx). Les mutations photo.add/remove sont appelées depuis ces pages.

## Verification

- Upload error surfaced to UI with user-friendly message.

## Tasks

- [x] **T06: Créer les hooks tRPC pour les photos** `est:30min`
  Créer apps/web/src/lib/trpc-hooks/photos.ts avec les hooks useMutation pour photos.getPresignedUrl, photos.add, photos.remove, photos.list, photos.reorder. Exporter les hooks typés.
  - Files: `apps/web/src/lib/trpc-hooks/photos.ts`
  - Verify: ls apps/web/src/lib/trpc-hooks/photos.ts

- [x] **T07: Créer composant PhotoCapture avec caméra et upload** `est:2h`
  Créer apps/web/src/components/photos/photo-capture.tsx. Props: objectId, onPhotoAdded(photo), onError. Fonctionnement: bouton qui ouvre un dialog avec 2 onglets (Appareil photo / Fichier) + intégration DuckDuckGo Images. L'input[type=file] utilise accept='image/*' capture='environment' pour caméra mobile. Preview de l'image sélectionnée avant upload. Upload via presigned URL (PUT request avec fetch). Appelle photos.getPresignedUrl → PUT vers uploadUrl → photos.add. Gestion d'erreur user-friendly.
  - Files: `apps/web/src/components/photos/`
  - Verify: Composant importe sans erreur dans la page objet

- [x] **T08: Intégrer galerie photo dans la page détail objet** `est:1h`
  Construire le panneau de gestion des photos sur la page détail objet. Affiche les photos en grille (3 colonnes), chaque photo avec bouton supprimer (icône X). Bouton Ajouter une photo qui ouvre PhotoCaptureDialog. Utilise trpc.objects.get.include (lorsque dispo) ou trpc.photos.list pour charger les photos. Invalide le cache après ajout/suppression.
  - Files: `apps/web/src/app/objects/[id]/page.tsx`, `apps/web/src/components/photos/photo-gallery.tsx`
  - Verify: Page objet affiche la galerie photo avec les photos existantes

- [x] **T09: Créer le client DuckDuckGo Images** `est:1h`
  Créer apps/web/src/lib/duckduckgo.ts avec la fonction searchImages(query: string): Promise<{url, title, thumbnail}[]>. Endpoint: https://duckduckgo.com/?q={encodeURIComponent(query)}+site%3Aimages&ia=image. Parser le HTML de la page pour extraire les URLs des images. Fallback: API JSON non-officielle (j Search ou DuckDuckGo lite). Limit 20 résultats.
  - Files: `apps/web/src/lib/duckduckgo.ts`
  - Verify: searchImages('chat') retourne un tableau non vide de résultats

## Files Likely Touched

- apps/web/src/lib/trpc-hooks/photos.ts
- apps/web/src/components/photos/
- apps/web/src/app/objects/[id]/page.tsx
- apps/web/src/components/photos/photo-gallery.tsx
- apps/web/src/lib/duckduckgo.ts
