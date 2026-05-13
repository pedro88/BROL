---
id: T05
parent: S01
milestone: M012
key_files:
  - apps/web/src/app/page.tsx
key_decisions:
  - Section renommée 'PRÊTS RÉCENTS', cards avec object.name + borrowerName + date retour, Link vers /objects/[id]
duration: 
verification_result: passed
completed_at: 2026-05-12T08:51:27.990Z
blocker_discovered: false
---

# T05: Section prêts récents corrigée avec cards cliquables

**Section prêts récents corrigée avec cards cliquables**

## What Happened

Implémenté dans page.tsx: titre changé en '// PRÊTS RÉCENTS'. Cards loansQuery.data.items mappent object.name + borrowerName (depuis borrowerName field ou borrower.name) + returnDueDate. Cards wrappées dans Link vers /objects/[id]. Empty state si aucun prêt.

## Verification

Vérifié via lecture de page.tsx: PRÊTS RÉCENTS titre, Link vers /objects/[id], borrowerName + returnDueDate affichés

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep 'PRÊTS\|RETOURS\|/objects/\[' apps/web/src/app/page.tsx` | 0 | ✅ pass | 10ms |

## Deviations

None. T05 livrée inline dans S01.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/app/page.tsx`
