---
id: T09
parent: S02
milestone: M011
key_files:
  - apps/web/src/lib/duckduckgo.ts
key_decisions:
  - Proxy CORS via duckduckgo.com/iu/?u=URL — pas de serveur proxy nécessaire côté API
  - Images DuckDuckGo sont proxées via le endpoint iu/ de DDG, ce qui évite les blocages CORS des sites d'images
duration: 
verification_result: untested
completed_at: 2026-05-11T14:36:04.088Z
blocker_discovered: false
---

# T09: Client DuckDuckGo Images avec parsing HTML et proxy CORS

**Client DuckDuckGo Images avec parsing HTML et proxy CORS**

## What Happened

Client DuckDuckGo Images avec 3 patterns de parsing: JSON embarqué avec URLs d'images directes, scripts window.__json avec URLs, thumbnails duckduckgo.com/iu/. Fonction proxyImageUrl pour contourner CORS. Filtrage des URLs valides (exclut spacers, trackers, logos).

## Verification

TypeScript compile sans erreur dans duckduckgo.ts. Module exporte searchDuckDuckGoImages et proxyImageUrl.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None

## Known Issues

Parsing HTML fragile — nécessite maintenance si DuckDuckGo change sa structure. Limite: 20 résultats par recherche.

## Files Created/Modified

- `apps/web/src/lib/duckduckgo.ts`
