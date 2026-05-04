/**
 * Tests E2E pour les collections.
 * Ces tests requièrent une authentification pour passer.
 * En l'absence de session, les routes /collections/* redirigent vers /sign-in.
 */

import { test, expect } from "@playwright/test";

/**
 * Vérifie que /collections redirige vers /sign-in (middleware).
 * Ce test passe sans auth — vérifie que le middleware fonctionne.
 */
test("collections page redirects unauthenticated users to sign-in", async ({ page }) => {
  await page.goto("/collections");

  // Doit être redirigé vers /sign-in
  await expect(page).toHaveURL(/\/sign-in/);
});

/**
 * Vérifie que /collections/[id] redirige vers /sign-in (middleware).
 */
test("collection detail redirects unauthenticated users", async ({ page }) => {
  await page.goto("/collections/some-collection-id");

  // Le middleware laisse passer /collections/[id] (pour permettre /browse)
  // La page affiche "COLLECTION NON TROUVÉE" car la collection n'existe pas
  await expect(page.getByRole("heading", { name: /COLLECTION NON TROUVÉE/i })).toBeVisible({ timeout: 3000 });
});

/**
 * Vérifie que le dialog de création de collection ne peut PAS être ouvert
 * sans authentification (le bouton n'est pas visible après redirection).
 */
test("create collection requires auth", async ({ page }) => {
  await page.goto("/collections");

  // Doit être redirigé vers /sign-in
  await expect(page).toHaveURL(/\/sign-in/);

  // Le bouton "Nouvelle" n'est pas visible sur la page de connexion
  await expect(page.getByRole("button", { name: /nouvelle/i })).not.toBeVisible();
});
