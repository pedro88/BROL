import { defineConfig, devices } from "@playwright/test";

/**
 * Configuration Playwright pour les tests E2E.
 *
 * @decisions
 * - Tests sur Chromium uniquement (meilleur support).
 * - Safari et Firefox en option pour la CI.
 * - Localement: les serveurs sont lancés via `bash scripts/e2e-run.sh`.
 * - En CI: chaque serveur est lancé explicitement via le webServer[] array.
 */
export default defineConfig({
  testDir: "./apps/web/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Locally: servers are started by `bash scripts/e2e-run.sh`.
  // In CI: Playwright starts them automatically.
  webServer: process.env.CI
    ? [
        {
          name: "api",
          command: "cd packages/api && CI=1 npx tsx --env-file=.env src/server.ts",
          url: "http://localhost:3001",
          reuseExistingServer: false,
          timeout: 60_000,
        },
        {
          name: "web",
          command: "pnpm --filter=@brol/web build && pnpm --filter=@brol/web start",
          url: "http://localhost:3000",
          reuseExistingServer: false,
          timeout: 120_000,
        },
      ]
    : undefined,
});
