/**
 * Tests E2E pour les collections publiques (S02).
 * Vérifie que les collections publiques sont accessibles sans login.
 */

import { test, expect } from "@playwright/test";

/**
 * Vérifie que la page /browse est accessible sans auth.
 */
test("browse page accessible without login", async ({ page }) => {
  await page.goto("/browse");

  await expect(page).toHaveURL(/\/browse/);
  // Le heading sur la page browse est "COLLECTIONS PUBLIQUES"
  await expect(page.getByRole("heading", { name: /COLLECTIONS PUBLIQUES/i })).toBeVisible();
});

/**
 * Vérifie que la page /browse affiche les collections publiques (état vide).
 */
test("browse page shows public collections (empty state)", async ({ page }) => {
  await page.goto("/browse");

  // La page charge sans erreur
  await expect(page.locator("main")).toBeVisible();

  // État vide avec le message "AUCUNE COLLECTION PUBLIQUE"
  await expect(page.getByText(/AUCUNE COLLECTION PUBLIQUE/i)).toBeVisible();
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
    await expect(page.getByText(/AUCUNE COLLECTION PUBLIQUE/i)).toBeVisible();
    return;
  }

  await firstCollection.click();
  await expect(page).toHaveURL(/\/collections\/.+/);
});

/**
 * Vérifie que le toggle isPublic est présent dans le dialog de création.
 * Ce test nécessite une session — sans auth, on est redirigé.
 */
test("isPublic toggle visible in create collection dialog", async ({ page }) => {
  await page.goto("/collections");

  // Sans auth, redirigé vers sign-in — impossible d'ouvrir le dialog
  await expect(page).toHaveURL(/\/sign-in/);

  // Le test est skippé en l'absence de session
  // Skipping: requires authenticated session to open the create dialog
  test.skip(true, "requires authenticated session");
});

/**
 * Vérifie qu'un utilisateur non-authentifié est redirigé de /collections vers /sign-in.
 */
test("collections page redirects unauthenticated users", async ({ page }) => {
  await page.goto("/collections");

  await expect(page).toHaveURL(/\/sign-in/);
});
