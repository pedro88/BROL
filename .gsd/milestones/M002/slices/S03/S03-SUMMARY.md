---
id: S03
title: "Mock data → real tRPC queries"
status: complete
---

# S03: Mock data → real tRPC queries

**Status:** ✅ Complete

## What was done

- `/collections` affiche les vraies données via `collections.list` (plus de mock)
- `/collections/[id]` affiche les vrais objets via `objects.list`
- `/objects/add` crée un vrai objet en DB
- Toutes les pages protègées redirigent vers /sign-in si pas de session

## Key files
- `apps/web/src/app/collections/page.tsx`
- `apps/web/src/app/collections/[id]/page.tsx`
- `apps/web/src/app/objects/add/page.tsx`
- `packages/api/src/routers/objects.ts`
