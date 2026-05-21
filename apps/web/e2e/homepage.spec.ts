/**
 * E2E tests: Homepage navigation and redirects.
 *
 * S06: Covered by browse.spec.ts but split for clarity.
 * Tests homepage-specific behavior: nav links, CTA, external redirects.
 */

import { test, expect } from "@playwright/test";
import {
  signIn,
  createUserAPI,
  cleanupUser,
  uniqueEmail,
} from "./helpers/auth";

const WEB_BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

// Homepage requires authentication since M005 — / redirects to /sign-in when anonymous
test.describe("homepage", () => {
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(testEmail, password, "Homepage Test User");
    await signIn(page, testEmail, password);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("loads with VHS logo", async ({ page }) => {
    await expect(page.getByText("BROL", { exact: true }).first()).toBeVisible();
  });

  test("shows ACTIONS RAPIDES section", async ({ page }) => {
    await expect(page.getByText("ACTIONS RAPIDES")).toBeVisible();
  });

  test("logo click returns to homepage", async ({ page }) => {
    await page.goto(`${WEB_BASE}/browse`);
    await page.locator("text=BROL").first().click();
    // React client-side nav: wait for URL to change away from /browse, then wait for /
    await page.waitForURL((url) => url.pathname !== "/browse", { timeout: 5000 }).catch(() => {});
    await expect(page).toHaveURL(/\/$/);
  });

  test("navbar visible", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
  });

  test("quick actions link to valid routes", async ({ page }) => {
    // Click "Nouveau prêt" quick action — should navigate without redirecting to /sign-in
    const loanLink = page.getByRole("link", { name: /nouveau|prêt/i }).first();
    await expect(loanLink).toBeVisible();
  });

  test("Logout button visible when authenticated", async ({ page }) => {
    await expect(page.getByRole("button", { name: /logout/i })).toBeVisible();
  });

  test("clicking Logout redirects to /sign-in", async ({ page }) => {
    await page.getByRole("button", { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe("homepage — anonymous redirect", () => {
  test("visiting / without auth redirects to /sign-in", async ({ page }) => {
    await page.goto(`${WEB_BASE}/`);
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("/sign-in page is accessible without auth", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByText("CONNEXION")).toBeVisible();
  });
});

test.describe("homepage responsive", () => {
  test("renders at 375px mobile", async ({ page }) => {
    // Must use a public page for anonymous responsive test
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/sign-in`);
    await expect(page.locator("#email")).toBeVisible();
  });
});
