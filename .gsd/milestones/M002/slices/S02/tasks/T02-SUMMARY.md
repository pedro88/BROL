---
id: T02
parent: S02
milestone: M002
key_files:
  - packages/api/src/routers/collections.ts
key_decisions:
  - Utiliser `publicProcedure` (pas `protectedProcedure`) pour listPublic et getPublic — anyone peut voir les collections publiques
  - Ne jamais exposer d infos sensibles (email, userId) dans les réponses publiques — uniquement name
duration: 
verification_result: passed
completed_at: 2026-05-04T07:09:46.594Z
blocker_discovered: false
---

# T02: Procedures listPublic et getPublic testées et fonctionnelles

**Procedures listPublic et getPublic testées et fonctionnelles**

## What Happened

Les procédures `listPublic` et `getPublic` étaient déjà implémentées dans `collections.ts`. `listPublic` retourne une liste paginée de collections publiques avec ownerName et objectCount. `getPublic` retourne les détails d'une collection publique par ID, avec ses objets (sans les prêts). Aucune information sensible n'est exposée. Tests d'API confirms: `curl http://localhost:3001/api/trpc/collections.listPublic` → `{ items: [], nextCursor: null }`.

## Verification

curl http://localhost:3001/api/trpc/collections.listPublic → {\"items\":[],\"nextCursor\":null} ✓

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `curl -s http://localhost:3001/api/trpc/collections.listPublic` | 0 | ✅ pass | 0ms |

## Deviations

None — les procédures `listPublic` et `getPublic` étaient déjà implémentées dans le router lors de la reprise.

## Known Issues

TypeScript errors pré-existants dans `auth.ts` (champs Session incorrects) — non traités ici.

## Files Created/Modified

- `packages/api/src/routers/collections.ts`
