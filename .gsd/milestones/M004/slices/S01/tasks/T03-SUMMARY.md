---
id: T03
parent: S01
milestone: M004
key_files:
  - /tmp/e2e-full-run.log
key_decisions:
  - Baseline complète établie pour le suivi des prochaines slices
duration: 
verification_result: passed
completed_at: 2026-05-05T08:07:13.944Z
blocker_discovered: false
---

# T03: Run E2E complet: 56/76 passés (74%), +28 vs baseline initiale

**Run E2E complet: 56/76 passés (74%), +28 vs baseline initiale**

## What Happened

Run complet des 76 tests E2E effectué. Résultat: 56 passés, 20 échoués (74%). La baseline initiale était de 28/76 (37%). Les erreurs fetch failed ont toutes disparu. Les 20 échecs restants se répartissent en: homepage logo (1), isPublic toggle (2), collections CRUD (4), objects CRUD (4), browse/public-collections (9). Les tests auth (sign-up, sign-in, validation, toggle, OAuth) sont tous verts.

## Verification

bash scripts/e2e-run.sh --reporter=list → 56 passed, 20 failed, 0 errors infrastructure

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `bash scripts/e2e-run.sh --reporter=list` | 1 | ⚠️ 56/76 passés (74%) | 78000ms |

## Deviations

None

## Known Issues

20 tests échoués — catégorisés pour S02-S04

## Files Created/Modified

- `/tmp/e2e-full-run.log`
