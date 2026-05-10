# S06: Fix loans.test.ts for new schema — UAT

**Milestone:** M008
**Written:** 2026-05-10T14:22:10.716Z

## UAT — S06

**Vérification:** `vitest run` → 16/16 tests passent.

Les tests suivants sont couverts :
- lentOut: empty + active loans with borrower
- borrowed: empty + borrowed items
- create: loan to contact with account, loan to contact without account, object not found, already on loan
- return, remind, cancel
