/**
 * Tests E2E pour les objets.
 * Ces tests requièrent une authentification.
 * Sans session, les routes /objects/* redirigent vers /sign-in (middleware).
 */

import { test, expect } from "@playwright/test";

/**
 * Vérifie que /objects/add redirige vers /sign-in (middleware).
 */
test("add object page requires auth", async ({ page }) => {
  await page.goto("/objects/add");

  // Redirection vers /sign-in (pas de bouton de retour visible sur la page de connexion)
  await expect(page).toHaveURL(/\/sign-in/);
});

/**
 * Vérifie que /objects/[id] redirige vers /sign-in (middleware).
 */
test("object detail requires auth", async ({ page }) => {
  await page.goto("/objects/test-object-id");

  // Redirection vers /sign-in
  await expect(page).toHaveURL(/\/sign-in/);
});
