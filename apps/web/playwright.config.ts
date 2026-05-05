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
  // Use production build with test DATABASE_URL so it matches the API server.
  // API server must be running separately with DATABASE_URL=brol.
  webServer: {
    command: "DATABASE_URL=\"postgresql://postgres:password@localhost:5432/brol?schema=public\" pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30 * 1000,
    env: {
      DATABASE_URL: "postgresql://postgres:password@localhost:5432/brol?schema=public",
    },
  },
});
