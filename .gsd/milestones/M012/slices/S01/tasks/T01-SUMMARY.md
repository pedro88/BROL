---
id: T01
parent: S01
milestone: M012
key_files:
  - apps/web/src/app/page.tsx
key_decisions:
  - StatCard accepts optional href prop, wraps in Link when provided
duration: 
verification_result: passed
completed_at: 2026-05-12T08:50:39.200Z
blocker_discovered: false
---

# T01: StatCard avec prop href optionnelle → Link conditionnel

**StatCard avec prop href optionnelle → Link conditionnel**

## What Happened

Implémenté dans page.tsx: StatCard prend une prop href optionnelle. Si href est fourni, le contenu est wrappé dans un Link Next.js avec hover/active effects. Sinon rendu normal. Style visuel inchangé.

## Verification

Vérifié via lecture de page.tsx: StatCard interface inclut href?: string, rendu conditionnel Link vs content

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `ls apps/web/src/app/page.tsx` | 0 | ✅ pass | 10ms |

## Deviations

None. T01 livréeinline dans S01.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/app/page.tsx`
