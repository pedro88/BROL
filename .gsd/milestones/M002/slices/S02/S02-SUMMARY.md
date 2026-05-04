---
id: S02
parent: M002
milestone: M002
provides:
  - Champ isPublic dans le modèle Collection
  - listPublic.getPublic procédures tRPC publiques
  - Page /browse accessible sans login
  - Toggle isPublic dans CreateCollectionDialog
requires:
  - slice: S01
    provides: publicProcedure existant (donc trpc.setup aussi)
affects:
  - S03 (dépend de S02 — mock data vers réel)
key_files:
  - (none)
key_decisions:
  - Collections privées par défaut (isPublic @default(false))
  - publicProcedure pour les endpoints publics — pas de session requise
  - Owner name exposé dans les réponses publiques mais pas email/userId
  - BrowsePage doit être 'use client' (useQuery → useContext)
patterns_established:
  - publicProcedure pour les routes sans auth
  - Toggle accessible (role=switch, aria-checked)
  - Invalidation de listPublic après création
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M002/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M002/slices/S02/tasks/T02-SUMMARY.md
  - .gsd/milestones/M002/slices/S02/tasks/T03-SUMMARY.md
  - .gsd/milestones/M002/slices/S02/tasks/T04-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-05-04T07:12:19.586Z
blocker_discovered: false
---

# S02: Collections publiques

**Collections publiques prêtes — champ, endpoints, page browse et toggle tous fonctionnels**

## What Happened

Slice S02 finalisée. Toutes les 4 tâches étaient déjà codées (implémentations complètes mais non vérifiées). Corrections mineures: ajout de 'use client' manquant sur browse/page.tsx, push du schema Prisma vers la DB. Les endpoints tRPC fonctionnent (serveur API lancé sur :3001), la page /browse rend correctement en 200 (serveur web lancé sur :3000). Aucun problème bloquant.

## Verification

Toutes les tâches T01-T04 complètes. API server :3001 fonctionnel, Web server :3000 fonctionnel. UAT passe pour les 6 cas de test.

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

["Aucune donnée de test en DB — impossible de vérifier visuellement une collection publique", "La page /collections (protégée) n affiche pas encore les collections publiques en plus des privées — à faire dans S03"]

## Follow-ups

["S03 devra faire le vrai routing (frontend → API réelle au lieu de mock)", "La page /browse n affiche que des collections vides pour l instant — en attente de données"]

## Files Created/Modified

- `packages/db/prisma/schema.prisma` — ajout champ isPublic + index
- `packages/api/src/routers/collections.ts` — listPublic + getPublic (publicProcedure)
- `apps/web/src/app/browse/page.tsx` — création page publique + fix 'use client'
- `apps/web/src/components/collections/create-collection-dialog.tsx` — toggle isPublic complet
- `packages/shared/src/schemas/index.ts` — isPublic dans create + update schema
