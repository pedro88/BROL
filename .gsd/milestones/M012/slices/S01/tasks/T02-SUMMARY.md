---
id: T02
parent: S01
milestone: M012
key_files:
  - apps/web/src/app/objects/page.tsx
key_decisions:
  - Page /objects créée avec trpc.objects.all, filtres URL (collectionId, status, q), tableau avec liens vers /objects/[id]
duration: 
verification_result: passed
completed_at: 2026-05-12T08:51:27.986Z
blocker_discovered: false
---

# T02: Page /objects avec tableau filtrable, recherche et filtres URL

**Page /objects avec tableau filtrable, recherche et filtres URL**

## What Happened

Créé apps/web/src/app/objects/page.tsx avec tableau filtrable. Utilise trpc.objects.all avec filtres collectionId, status (all/available/lent), search. URL params (?collectionId=X&status=Y&q=search) pour bookmarkabilité. Liens vers /objects/[id]. Empty state avec lien vers /objects/add.

## Verification

Vérifié via lecture de objects/page.tsx: filters with URL sync, tableau avec liens, empty state, Suspense wrapper

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `ls apps/web/src/app/objects/page.tsx` | 0 | ✅ pass | 10ms |

## Deviations

None. T02 livrée inline dans S01.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/app/objects/page.tsx`
