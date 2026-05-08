---
estimated_steps: 4
estimated_files: 1
skills_used: []
---

# T02: Configurer Playwright pour lancer le serveur API (port 3001) en plus du web

1. Lire apps/web/playwright.config.ts
2. Ajouter un second webServer pour l'API (port 3001) OU modifier webServer pour utiliser un script qui lance les deux
3. Tester que Playwright lance bien les deux serveurs
4. Option : utiliser un script pnpm dev:all qui lance les deux serveurs, et pointer Playwright dessus

## Inputs

- `playwright.config.ts actuel ne lance que le web`

## Expected Output

- `playwright.config.ts avec double webServer`
- `Les deux ports répondent avant les tests`

## Verification

npx playwright test --reporter=line --grep 'browse' → sans fetch failed
