/**
 * Tests E2E pour l'authentification OAuth.
 * S05: OAuth sign-in + session + protected routes.
 *
 * @requires OAuth credentials configured in .env.local
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 *   APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY
 *
 * @decisions Tests vérifient que les boutons OAuth sont visibles et功能性.
 */

import { test, expect } from "@playwright/test";

/**
 * Vérifie que la page de connexion affiche les boutons OAuth.
 */
test("sign-in page renders OAuth buttons", async ({ page }) => {
  await page.goto("/sign-in");

  await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();

  // Boutons Google, GitHub, Apple attendus
  await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /github/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /apple/i })).toBeVisible();
});

/**
 * Vérifie que le middleware redirige vers /sign-in.
 */
test("unauthenticated user redirected to sign-in", async ({ page }) => {
  await page.goto("/collections");

  // Doit être redirigé vers la page de connexion
  await expect(page).toHaveURL(/\/sign-in/);
});

/**
 * Vérifie que /browse est accessible sans authentification.
 */
test("browse page accessible without auth", async ({ page }) => {
  await page.goto("/browse");

  // La page doit charger sans redirection
  await expect(page).toHaveURL(/\/browse/);
  await expect(page.getByRole("heading", { name: /parcourir|browse|collections/i })).toBeVisible();
});

/**
 * Vérifie qu'un utilisateur non-authentifié ne peut pas accéder à /settings.
 */
test("settings page requires auth", async ({ page }) => {
  await page.goto("/settings");

  // Doit être redirigé vers /sign-in
  await expect(page).toHaveURL(/\/sign-in/);
});
