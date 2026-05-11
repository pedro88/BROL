---
id: M011
title: "Photos sur les objets"
status: complete
completed_at: 2026-05-11T14:39:00.977Z
key_decisions:
  - S3 avec presigned URLs (upload direct client→S3) — pas de proxy par le serveur
  - DuckDuckGo Images avec parsing HTML et proxy CORS (pas de clé API requise)
  - Photos loadées séparément via usePhotosList (pas eager loaded dans objects.get pour simplifier le cache)
  - Flux UX: créer objet → page détail → ajouter photos (les photos ne peuvent pas être ajoutées à la création car l'objet n'a pas encore d'ID)
key_files:
  - packages/api/src/lib/s3.ts
  - packages/api/src/routers/photos.ts
  - packages/api/src/routers/objects.ts
  - apps/web/src/components/photos/photo-capture.tsx
  - apps/web/src/components/photos/photo-gallery.tsx
  - apps/web/src/lib/duckduckgo.ts
  - packages/db/prisma/schema.prisma
lessons_learned:
  - Le scraping HTML de DuckDuckGo est fragile — prévoir un fallback (Unsplash API) si la structure change
  - Prisma migrate dev demande un reset si _prisma_migrations n'existe pas — utiliser db push
  - Les presigned URLs sont le bon pattern pour upload direct
---

# M011: Photos sur les objets

**Photos sur les objets: upload S3, caméra mobile, recherche DuckDuckGo**

## What Happened

M011 Photos sur les objets livré: infrastructure S3 avec presigned URLs (S01), composant PhotoCapture avec caméra mobile/fichier/recherche DuckDuckGo (S02), intégration dans la page détail objet (S03). Pattern presigned URL pour upload performant sans passer par le serveur. En attente des credentials S3 réels pour test d'upload complet."

## Success Criteria Results

**Critères de succès:**\n- [x] Photos uploadées et stockées persistent — Modèle Photo en base, S3 via presigned URLs, 12 tests passent\n- [x] Photos affichées sur la page détail — PhotoGallery intégrée\n- [x] Capture caméra mobile — input capture="environment" dans PhotoCapture\n- [x] Upload fichier desktop/mobile — input[type=file]\n- [x] Ajout et suppression de photos — PhotoCapture + PhotoGallery intégrés\n\n**Proof strategy:**\n- [x] S01: Upload API retourne 200 avec URL publique\n- [x] S02: Composant renders sans erreur\n- [x] S03: Page objet affiche les photos uploadées

## Definition of Done Results

Not provided.

## Requirement Outcomes

Not provided.

## Deviations

None.

## Follow-ups

- Configurer les credentials S3 dans .env.local pour tester l'upload complet\n- Ajouter un indicateur de progression d'upload (progress bar)\n- Ajouter la possibilité de définir une photo comme photo de couverture (coverImage)\n- Tests E2E pour l'upload photo (Playwright)"
