/**
 * Tests E2E pour la page d'accueil.
 * @decisions Tests couvrent le happy path + erreurs basiques.
 */

import { test, expect } from "@playwright/test";

/**
 * Vérifie que la page d'accueil charge correctement.
 */
test("homepage loads", async ({ page }) => {
  await page.goto("/");

  // Header avec logo — use exact match to avoid title element
  await expect(page.getByText("BROL", { exact: true }).first()).toBeVisible();

  // Section actions rapides
  await expect(page.getByText("ACTIONS RAPIDES")).toBeVisible();
});

/**
 * Vérifie que la navigation fonctionne.
 */
test("navigation works", async ({ page }) => {
  await page.goto("/");

  // Aller aux collections (middleware redirige vers sign-in)
  await page.goto("/collections");
  await expect(page).toHaveURL(/\/sign-in/);
});

/**
 * Vérifie que /browse est accessible sans authentification.
 * @see public-collections.spec.ts for full /browse tests
 */
test("browse accessible without auth", async ({ page }) => {
  await page.goto("/browse");
  await expect(page).toHaveURL(/\/browse/);
  await expect(page.getByRole("heading", { name: /COLLECTIONS PUBLIQUES/i })).toBeVisible();
});

/**
 * Vérifie le comportement responsive.
 */
test.describe("responsive", () => {
  test("works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Logo visible — use exact match
    await expect(page.getByText("BROL", { exact: true }).first()).toBeVisible();

    // Navigation visible
    await expect(page.locator("nav")).toBeVisible();
  });
});
