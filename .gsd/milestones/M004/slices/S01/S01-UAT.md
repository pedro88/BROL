# S01: Diagnostiquer la cause racine des échecs E2E et stabiliser le serveur API — UAT

**Milestone:** M004
**Written:** 2026-05-05T08:07:24.439Z

1. `pnpm test:e2e` → lance les deux serveurs + les 76 tests
2. Les deux serveurs démarrent automatiquement
3. Les tests auth (sign-up, sign-in, validation, toggle) passent tous
4. Aucun `fetch failed` dans les logs
