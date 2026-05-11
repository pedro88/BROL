---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T09: Créer le client DuckDuckGo Images

Créer apps/web/src/lib/duckduckgo.ts avec la fonction searchImages(query: string): Promise<{url, title, thumbnail}[]>. Endpoint: https://duckduckgo.com/?q={encodeURIComponent(query)}+site%3Aimages&ia=image. Parser le HTML de la page pour extraire les URLs des images. Fallback: API JSON non-officielle (j Search ou DuckDuckGo lite). Limit 20 résultats.

## Inputs

- `packages/api/src/routers/photos.ts (pour integration dans le dialog)`

## Expected Output

- `apps/web/src/lib/duckduckgo.ts`

## Verification

searchImages('chat') retourne un tableau non vide de résultats
