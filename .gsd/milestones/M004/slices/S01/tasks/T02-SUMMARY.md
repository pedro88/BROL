---
id: T02
parent: S01
milestone: M004
key_files:
  - playwright.config.ts
  - scripts/e2e-run.sh
  - scripts/e2e-stop-servers.sh
  - package.json
key_decisions:
  - Utiliser un script e2e-run.sh pour gérer le lifecycle des serveurs localement
  - Playwright webServer[] array seulement en CI
  - ReuseExistingServer=true en local
duration: 
verification_result: passed
completed_at: 2026-05-05T08:07:03.442Z
blocker_discovered: false
---

# T02: Script e2e-run.sh + playwright.config.ts CI-aware + pnpm test:e2e pour lancer les tests avec les 2 serveurs

**Script e2e-run.sh + playwright.config.ts CI-aware + pnpm test:e2e pour lancer les tests avec les 2 serveurs**

## What Happened

Playwright config restructuré : webServer[] array seulement en CI, undefined en local. Script e2e-run.sh lance les deux serveurs (API sur 3001, Web sur 3000) attend la readiness, puis lance les tests. Le script arrête proprement les serveurs au cleanup. pnpm test:e2e ajouté au root package.json. Apps/web config aussi mis à jour pour supporter le double serveur.

## Verification

pnpm test:e2e --grep "toggle" → 2/2 tests passés (toggle sign-in/sign-up, toggle sign-up/sign-in)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `bash scripts/e2e-run.sh --grep "toggle" --reporter=list` | 0 | ✅ pass | 30900ms |

## Deviations

WebServer Playwright config simplifié — en local, les serveurs sont lancés par le script wrapper plutôt que par Playwright directement

## Known Issues

Aucun

## Files Created/Modified

- `playwright.config.ts`
- `scripts/e2e-run.sh`
- `scripts/e2e-stop-servers.sh`
- `package.json`
