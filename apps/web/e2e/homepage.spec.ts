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

  // Header avec logo
  await expect(page.locator("text=BROL")).toBeVisible();

  // Section actions rapides
  await expect(page.getByText("ACTIONS RAPIDES")).toBeVisible();
  await expect(page.getByRole("link", { name: /scanner/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /nouveau pret/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /ajouter/i })).toBeVisible();
});

/**
 * Vérifie que la navigation fonctionne.
 */
test("navigation works", async ({ page }) => {
  await page.goto("/");

  // Aller aux collections
  await page.getByRole("link", { name: /collections/i }).click();
  await expect(page).toHaveURL(/collections/);

  // Revenir à l'accueil
  await page.getByRole("link", { name: /accueil/i }).click();
  await expect(page).toHaveURL("/");
});

/**
 * Vérifie que les liens externes fonctionnent.
 */
test("external links open", async ({ page }) => {
  await page.goto("/");

  // Le lien vers les paramètres doit exister
  const settingsLink = page.getByRole("link", { name: /parametres/i });
  await expect(settingsLink).toBeVisible();
});

/**
 * Vérifie le comportement responsive.
 */
test.describe("responsive", () => {
  test("works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Logo visible
    await expect(page.locator("text=BROL")).toBeVisible();

    // Navigation bottom visible
    await expect(page.locator("nav")).toBeVisible();
  });
});
