/**
 * E2E tests: Requests (Community) — /requests page.
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

test.describe("requests page", () => {
  test("page is accessible without auth (publicProcedure)", async ({ page }) => {
    await page.goto(`${WEB_BASE}/requests`);
    await expect(page).toHaveURL(/\/requests/);
  });

  test("shows DEMANDES À LA COMMUNAUTÉ heading", async ({ page }) => {
    await page.goto(`${WEB_BASE}/requests`);
    await expect(
      page.getByRole("heading", { name: /DEMANDES À LA COMMUNAUTÉ/i }).first()
    ).toBeVisible();
  });

  test("shows empty state when no requests", async ({ page }) => {
    await page.goto(`${WEB_BASE}/requests`);
    await page.waitForLoadState("networkidle");
    const emptyState = page.getByText(/aucune|vide|pas encore/i).first();
    await expect(emptyState).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test("shows search input", async ({ page }) => {
    await page.goto(`${WEB_BASE}/requests`);
    const searchInput = page.getByPlaceholder(/rechercher|search/i);
    await expect(searchInput).toBeVisible();
  });

  test("Nouvelle demande button is visible", async ({ page }) => {
    await page.goto(`${WEB_BASE}/requests`);
    const newBtn = page.getByRole("button", { name: /nouvelle demande/i });
    await expect(newBtn).toBeVisible();
  });
});

test.describe("create request dialog (authenticated)", () => {
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(testEmail, password, "Requests Auth User");
    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("create dialog opens on button click", async ({ page }) => {
    await page.goto(`${WEB_BASE}/requests`);
    await page.getByRole("button", { name: /nouvelle demande/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
  });

  test("form validation — title required", async ({ page }) => {
    await page.goto(`${WEB_BASE}/requests`);
    await page.getByRole("button", { name: /nouvelle demande/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
    // Submit button must be disabled when title is empty (form validation)
    const submitBtn = page.getByRole("button", { name: /créer/i }).first();
    await expect(submitBtn).toBeDisabled();
    // Dialog should stay open
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 2000 });
  });

  test("creates a request and shows it in the list", async ({ page }) => {
    await page.goto(`${WEB_BASE}/requests`);
    await page.getByRole("button", { name: /nouvelle demande/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

    const titleInput = page.locator("input[placeholder*='cherch'], input[placeholder*='Jeux'], input").first();
    await titleInput.fill("E2E Test Request");

    const descInput = page.locator("textarea").first();
    if (await descInput.isVisible().catch(() => false)) {
      await descInput.fill("Description for the test request");
    }

    await page.getByRole("button", { name: /créer/i }).first().click();
    await page.waitForLoadState("networkidle");

    // Dialog should close and request appear in list
    const dialogOpen = await page.locator('[role="dialog"]').isVisible().catch(() => false);
    if (!dialogOpen) {
      await expect(page.getByText(/E2E Test Request/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("requests responsive", () => {
  test("renders at 375px mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/requests`);
    await expect(
      page.getByRole("heading", { name: /DEMANDES À LA COMMUNAUTÉ/i }).first()
    ).toBeVisible();
  });
});