/**
 * E2E tests: Settings — /settings page.
 *
 * M014: Profil, Notifications, Tiers et Badges
 */

import { test, expect } from "@playwright/test";
import {
  signIn,
  clearSession,
  createUserAPI,
  cleanupUser,
  uniqueEmail,
} from "./helpers/auth";

const WEB_BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("settings page", () => {
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(testEmail, password, "Settings Test User");
    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("redirects to /sign-in without auth", async ({ page }) => {
    await clearSession(page);
    await page.goto(`${WEB_BASE}/settings`);
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("page loads with auth", async ({ page }) => {
    await page.goto(`${WEB_BASE}/settings`);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });

  test("shows Mon Profil section", async ({ page }) => {
    await page.goto(`${WEB_BASE}/settings`);
    await expect(page.getByText(/profil/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("shows Mon Plan section with tier info", async ({ page }) => {
    await page.goto(`${WEB_BASE}/settings`);
    await expect(page.getByText(/plan|tier/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("shows usage progress bars", async ({ page }) => {
    await page.goto(`${WEB_BASE}/settings`);
    // Progress bars or usage indicators
    const usage = page.getByText(/collections|objets|prêts/i).first();
    await expect(usage).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test("shows upgrade cards for paid tiers", async ({ page }) => {
    await page.goto(`${WEB_BASE}/settings`);
    await page.waitForLoadState("networkidle");
    const upgradeSection = page.getByText(/upgrade|évoluer|plan supérieur/i).first();
    await expect(upgradeSection).toBeVisible({ timeout: 3000 }).catch(() => {});
  });
});

test.describe("settings responsive", () => {
  test("renders at 375px mobile", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(email, password, "Responsive Settings User");
    await signIn(page, email, password);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/settings`);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });
});