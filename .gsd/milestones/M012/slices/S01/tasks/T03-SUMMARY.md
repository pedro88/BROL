---
id: T03
parent: S01
milestone: M012
key_files:
  - apps/web/src/app/page.tsx
key_decisions:
  - StatCards liées: Objets→/objects, Prétés→/loans?tab=lent, Contacts→/contacts. variant warning conservé.
duration: 
verification_result: passed
completed_at: 2026-05-12T08:51:27.988Z
blocker_discovered: false
---

# T03: 3 StatCards liées aux bonnes pages

**3 StatCards liées aux bonnes pages**

## What Happened

Implémenté dans page.tsx: les 3 StatCards ont href. Objets=/objects, Prétés=/loans?tab=lent, Contacts=/contacts. variant warning conservé sur la carte Prétés quand activeLoans>0.

## Verification

Vérifié via lecture de page.tsx: StatCard avec href sur chaque instance

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -c 'href=' apps/web/src/app/page.tsx` | 0 | ✅ pass | 10ms |

## Deviations

None. T03 livrée inline dans S01.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/app/page.tsx`
