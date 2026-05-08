import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Servers must be launched manually via `bash scripts/e2e-run.sh` or `bash scripts/e2e-servers.sh`.
  // Do NOT use Playwright's webServer config — it causes EADDRINUSE / timeout issues.
  // CI uses e2e-run.sh to manage server lifecycle.
});
