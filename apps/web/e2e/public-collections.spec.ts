/**
 * Tests E2E pour les collections publiques (S02).
 * Vérifie que les collections publiques sont accessibles sans login.
 *
 * @decisions Tests utilisent le middleware de protection des routes.
 */

import { test, expect } from "@playwright/test";

/**
 * Vérifie que la page /browse est accessible sans auth.
 */
test("browse page accessible without login", async ({ page }) => {
  await page.goto("/browse");

  await expect(page).toHaveURL(/\/browse/);
  await expect(page.getByRole("heading", { name: /parcourir|browse/i })).toBeVisible();
});

/**
 * Vérifie que la page /browse affiche les collections publiques.
 */
test("browse page shows public collections", async ({ page }) => {
  await page.goto("/browse");

  // La page charge sans erreur
  await expect(page.locator("main")).toBeVisible();

  // État vide ou liste de collections
  const emptyState = page.getByText(/aucune collection|vide/i);
  const collections = page.locator(".card-vhs");
  await expect(emptyState.or(collections.first())).toBeVisible({ timeout: 5000 });
});

/**
 * Vérifie qu'on peut naviguer vers une collection publique depuis /browse.
 * (Ce test ne passe que si une collection publique existe en DB.)
 */
test("can navigate to public collection from browse", async ({ page }) => {
  await page.goto("/browse");

  const firstCollection = page.locator(".card-vhs").first();
  const hasCollections = await firstCollection.isVisible().catch(() => false);

  if (!hasCollections) {
    // Pas de collections publiques — test non applicable
    await expect(page.getByText(/aucune collection|vide/i)).toBeVisible();
    return;
  }

  await firstCollection.click();
  await expect(page).toHaveURL(/\/collections\/.+/);
});

/**
 * Vérifie que le toggle isPublic est présent dans le dialog de création.
 */
test("isPublic toggle visible in create collection dialog", async ({ page }) => {
  await page.goto("/collections");

  // Le bouton Nouvelle Collection nécessite auth — on vérifie que le dialog contient le toggle
  // Ce test passe si l'utilisateur est connecté
  await page.getByRole("button", { name: /nouvelle/i }).click();

  // Vérifier que le dialog s'ouvre
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Le toggle isPublic (switch "Public") doit être présent
  const publicToggle = page.getByText(/public/i);
  await expect(publicToggle.or(page.locator("[role='switch']"))).toBeVisible({ timeout: 2000 });
});

/**
 * Vérifie qu'un utilisateur non-authentifié est redirigé de /collections vers /sign-in.
 */
test("collections page redirects unauthenticated users", async ({ page }) => {
  await page.goto("/collections");

  await expect(page).toHaveURL(/\/sign-in/);
});
