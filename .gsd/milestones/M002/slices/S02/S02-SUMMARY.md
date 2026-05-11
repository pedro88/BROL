---
id: S02
title: "Collections publiques"
status: complete
---

# S02: Collections publiques

**Status:** ✅ Complete

## What was done

- Champ `isPublic Boolean @default(false)` ajouté au modèle Collection
- tRPC `collections.listPublic` et `collections.getPublic` en `publicProcedure`
- Page `/browse` — liste toutes les collections publiques sans auth
- Page `/collections/[id]` — accessible publiquement si isPublic=true, sinon redirect
- Toggle isPublic dans `/collections/[id]/edit`
- Les objets d'une collection publique sont visibles sans login

## Key files
- `packages/api/src/routers/collections.ts` (listPublic, getPublic)
- `apps/web/src/app/browse/page.tsx`
- `apps/web/src/app/collections/[id]/page.tsx`
- `apps/web/src/app/collections/[id]/edit/page.tsx`
