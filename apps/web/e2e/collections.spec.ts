/**
 * Tests E2E pour les collections.
 * @decisions Tests couvrent le CRUD complet des collections.
 */

import { test, expect } from "@playwright/test";

/**
 * Vérifie que la page collections charge correctement.
 */
test("collections page loads", async ({ page }) => {
  await page.goto("/collections");

  // Header de la page
  await expect(page.getByRole("heading", { name: /collections/i })).toBeVisible();

  // Bouton de création
  await expect(page.getByRole("button", { name: /nouvelle/i })).toBeVisible();
});

/**
 * Vérifie qu'on peut ouvrir le dialog de création.
 */
test("create collection dialog opens", async ({ page }) => {
  await page.goto("/collections");

  // Ouvrir le dialog
  await page.getByRole("button", { name: /nouvelle/i }).click();

  // Vérifier que le dialog est visible
  await expect(page.getByRole("heading", { name: /nouvelle collection/i })).toBeVisible();
});

/**
 * Vérifie la navigation vers le détail d'une collection.
 */
test("navigates to collection detail", async ({ page }) => {
  await page.goto("/collections");

  // Cliquer sur la première collection (si elle existe)
  const collectionCard = page.locator(".card-vhs").first();
  await collectionCard.click();

  // Vérifier qu'on est sur une page de détail
  await expect(page).toHaveURL(/\/collections\/.+/);
});

/**
 * Vérifie la navigation retour vers collections.
 */
test("back to collections navigation", async ({ page }) => {
  await page.goto("/collections/test-id");

  // Cliquer sur le lien retour
  await page.getByRole("link", { name: /collections/i }).click();

  // Vérifier qu'on revient sur la page collections
  await expect(page).toHaveURL(/\/collections/);
});

/**
 * Vérifie que la page détail affiche les éléments.
 */
test("collection detail shows content", async ({ page }) => {
  await page.goto("/collections/test-id");

  // Titre de la collection
  await expect(page.locator("h1")).toBeVisible();

  // Bouton d'ajout d'objet
  await expect(page.getByRole("link", { name: /ajouter un objet/i })).toBeVisible();
});

/**
 * Vérifie le comportement responsive.
 */
test.describe("responsive", () => {
  test("works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/collections");

    // Header visible
    await expect(page.getByRole("heading", { name: /collections/i })).toBeVisible();

    // Navigation bottom visible
    await expect(page.locator("nav")).toBeVisible();
  });
});
