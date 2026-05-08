/**
 * E2E tests: Homepage navigation and redirects.
 *
 * S06: Covered by browse.spec.ts but split for clarity.
 * Tests homepage-specific behavior: nav links, CTA, external redirects.
 */

import { test, expect } from "@playwright/test";

const WEB_BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("homepage", () => {
  test("loads with VHS logo", async ({ page }) => {
    await page.goto(`${WEB_BASE}/`);
    await expect(page.getByText("BROL", { exact: true }).first()).toBeVisible();
  });

  test("shows ACTIONS RAPIDES section", async ({ page }) => {
    await page.goto(`${WEB_BASE}/`);
    await expect(page.getByText("ACTIONS RAPIDES")).toBeVisible();
  });

  test("logo click returns to homepage", async ({ page }) => {
    await page.goto(`${WEB_BASE}/browse`);
    await page.locator("text=BROL").first().click();
    await expect(page).toHaveURL(`${WEB_BASE}/`);
  });

  test("collections CTA redirects to sign-in when not authenticated", async ({ page }) => {
    await page.goto(`${WEB_BASE}/`);
    // Find a CTA or quick action for collections
    const collectionsLink = page.getByRole("link", { name: /collections/i }).first();
    await collectionsLink.click();
    // Should redirect to sign-in (not authenticated)
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("navbar visible", async ({ page }) => {
    await page.goto(`${WEB_BASE}/`);
    await expect(page.locator("nav")).toBeVisible();
  });
});

test.describe("homepage responsive", () => {
  test("renders at 375px mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/`);
    await expect(page.getByText("BROL", { exact: true }).first()).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
  });
});
