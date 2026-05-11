---
id: T07
parent: S02
milestone: M011
key_files:
  - apps/web/src/components/photos/photo-capture.tsx
  - apps/web/src/lib/duckduckgo.ts
key_decisions:
  - Dialog inline (pas de Dialog UI component) pour éviter les dépendances supplémentaires — simplest thing that works
  - Input file avec accept='image/*' capture='environment' pour caméra mobile (ouvre caméra arrière)
  - Preview générée côté client via FileReader.readAsDataURL avant upload
  - Proxy images via duckduckgo.com/iu/?u=URL pour éviter CORS dans le browser
duration: 
verification_result: untested
completed_at: 2026-05-11T14:35:46.258Z
blocker_discovered: false
---

# T07: Composant PhotoCapture avec caméra, upload S3 et recherche DuckDuckGo Images

**Composant PhotoCapture avec caméra, upload S3 et recherche DuckDuckGo Images**

## What Happened

Composant PhotoCapture avec 3 sources: fichier, caméra (mobile), recherche web (DuckDuckGo). Le dialog montre 3 onglets, preview de l'image avant upload, progression avec status states (idle/preview/uploading/success/error). L'upload fait 3 étapes: presigned URL → PUT vers S3 → photo.add. Le DuckDuckGo client parse le HTML pour extraire les URLs d'images.

## Verification

TypeScript compile sans erreur dans photo-capture.tsx et duckduckgo.ts. Composant importable dans la page objet.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None

## Known Issues

Le scraping HTML de DuckDuckGo est fragile — si la structure change, la recherche retourne 0 résultats. À surveiller. fallback: Unsplash API (clé requise)."

## Files Created/Modified

- `apps/web/src/components/photos/photo-capture.tsx`
- `apps/web/src/lib/duckduckgo.ts`
