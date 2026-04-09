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

  // Header avec logo - utilise le span spécifique
  await expect(page.locator("header span:text('BROL')")).toBeVisible();

  // Section actions rapides
  await expect(page.getByText("ACTIONS RAPIDES")).toBeVisible();

  // Liens d'actions existent (vérifie par texte partiel)
  await expect(page.getByRole("link", { name: /scanner/i })).toBeVisible();
});

/**
 * Vérifie que la navigation fonctionne.
 */
test("navigation works", async ({ page }) => {
  await page.goto("/");

  // Aller aux collections via la navigation bottom
  await page.locator("nav").getByRole("link", { name: /collections/i }).click();
  await expect(page).toHaveURL(/collections/);

  // Revenir à l'accueil via la navigation bottom
  await page.locator("nav").getByRole("link", { name: /accueil/i }).click();
  await expect(page).toHaveURL("/");
});

/**
 * Vérifie que les liens fonctionnent.
 */
test("links are present", async ({ page }) => {
  await page.goto("/");

  // Le header doit avoir un lien settings
  const header = page.locator("header");
  await expect(header.getByRole("link")).toHaveCount(1);
});

/**
 * Vérifie le comportement responsive.
 */
test.describe("responsive", () => {
  test("works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Logo visible via header
    await expect(page.locator("header span:text('BROL')")).toBeVisible();

    // Navigation bottom visible
    await expect(page.locator("nav")).toBeVisible();
  });
});
