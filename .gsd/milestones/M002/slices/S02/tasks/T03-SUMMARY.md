---
id: T03
parent: S02
milestone: M002
key_files:
  - apps/web/src/app/browse/page.tsx
key_decisions:
  - BrowsePage doit être un Client Component (useQuery → useContext React). Impossible à render côté serveur.
duration: 
verification_result: passed
completed_at: 2026-05-04T07:11:13.084Z
blocker_discovered: false
---

# T03: Page /browse corrigée et fonctionnelle

**Page /browse corrigée et fonctionnelle**

## What Happened

La page /browse existait déjà mais crashait avec `TypeError: useContext is not a function` car c'était un Server Component utilisant useQuery (client-only). Fix: ajout de 'use client' en haut du fichier. Le middleware autorise déjà /browse. La page affiche correctement le titre et l'état vide (aucune collection publique en DB).

## Verification

curl -o /dev/null -w '%{http_code}' http://localhost:3000/browse → 200 ✓ ; grep COLLECTIONS PUBLIQUES dans le HTML → présent ✓

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/browse` | 0 | ✅ pass | 0ms |
| 2 | `curl -s http://localhost:3000/browse | grep -o 'COLLECTIONS PUBLIQUES'` | 0 | ✅ pass | 0ms |

## Deviations

`'use client'` manquant — ajouté pour corriger le crash React (Server Component ne peut pas utiliser useQuery). `dynamic = 'force-dynamic'` estredondant avec 'use client' mais inoffensif.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/app/browse/page.tsx`
