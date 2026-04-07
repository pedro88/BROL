/**
 * Tests E2E pour les objets.
 * @decisions Tests couvrent l'ajout et la visualisation d'objets.
 */

import { test, expect } from "@playwright/test";

/**
 * Vérifie que la page d'ajout d'objet charge correctement.
 */
test("add object page loads", async ({ page }) => {
  await page.goto("/objects/add");

  // Titre de la page
  await expect(page.getByRole("heading", { name: /ajouter un objet/i })).toBeVisible();

  // Bouton de retour
  await expect(page.getByRole("link", { name: /retour/i })).toBeVisible();
});

/**
 * Vérifie que la page d'ajout avec collectionId charge correctement.
 */
test("add object page with collection param loads", async ({ page }) => {
  await page.goto("/objects/add?collectionId=test-collection");

  // Titre de la page
  await expect(page.getByRole("heading", { name: /ajouter un objet/i })).toBeVisible();

  // Le bouton retour doit pointer vers la collection
  const backLink = page.getByRole("link", { name: /retour/i });
  await expect(backLink).toHaveAttribute("href", /\/collections\/test-collection/);
});

/**
 * Vérifie le formulaire d'objet.
 */
test("object form has required fields", async ({ page }) => {
  await page.goto("/objects/add");

  // Vérifier que le champ nom existe
  await expect(page.getByLabel(/nom/i)).toBeVisible();

  // Vérifier le select de condition
  await expect(page.locator("select#collectionId, input[name='collectionId']").or(page.locator("select"))).toBeVisible();
});

/**
 * Vérifie la navigation vers le détail d'un objet.
 */
test("navigates to object detail", async ({ page }) => {
  await page.goto("/objects/test-id");

  // Titre de l'objet ou message de chargement
  await expect(page.locator("h1")).toBeVisible();

  // Actions disponibles
  await expect(page.getByRole("button", { name: /preter/i })).toBeVisible();
});

/**
 * Vérifie le comportement responsive.
 */
test.describe("responsive", () => {
  test("works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/objects/add");

    // Titre visible
    await expect(page.getByRole("heading", { name: /ajouter un objet/i })).toBeVisible();

    // Navigation visible
    await expect(page.locator("nav")).toBeVisible();
  });
});
