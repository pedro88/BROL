---
id: T01
parent: S03
milestone: M008
key_files:
  - apps/web/src/app/page.tsx
key_decisions:
  - Replaced /loans/new → /loans in dashboard QuickAction
duration: 
verification_result: untested
completed_at: 2026-05-10T13:54:48.065Z
blocker_discovered: false
---

# T01: Dashboard /loans/new → /loans routing fix

**Dashboard /loans/new → /loans routing fix**

## What Happened

S03/T01 : href="/loans/new" remplacé par href="/loans" dans le QuickAction du dashboard. /loans existe déjà et affiche la liste des prêts avec bouton de création inline.

## Verification

Navigation : http://localhost:3000 → cliquer sur "NOUVEAU PRÊT" → arrive sur /loans (200, pas 404)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/app/page.tsx`
