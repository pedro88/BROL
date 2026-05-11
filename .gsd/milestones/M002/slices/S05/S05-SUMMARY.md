---
id: S05
title: "Tests e2e OAuth + public visibility"
status: complete
---

# S05: Tests e2e OAuth + public visibility

**Status:** ✅ Complete

## What was done

- `apps/web/e2e/auth.spec.ts` — sign-up, sign-in, validation formulaire, session persistence, sign-out, middleware redirects
- `apps/web/e2e/public-collections.spec.ts` — browse public, access control, isPublic toggle
- `apps/web/e2e/browse.spec.ts` — homepage, navbar, quick actions
- Auth helpers réutilisables dans `apps/web/e2e/helpers/auth.ts`
- OAuth (Google/GitHub/Apple) skippé — credentials non-configurés

## Key files
- `apps/web/e2e/auth.spec.ts`
- `apps/web/e2e/public-collections.spec.ts`
- `apps/web/e2e/browse.spec.ts`
- `apps/web/e2e/helpers/auth.ts`
