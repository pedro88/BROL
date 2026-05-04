/**
 * Tests E2E pour l'authentification.
 * S05: Email/password sign-in + middleware redirects + session persistence.
 *
 * @decisions OAuth (Google, GitHub, Apple) commented out in sign-in page.
 * Tests OAuth are skipped. Email/password tested instead.
 */

import { test, expect } from "@playwright/test";

/**
 * Vérifie que la page de connexion affiche le formulaire email/password.
 */
test("sign-in page renders email/password form", async ({ page }) => {
  await page.goto("/sign-in");

  await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
});

/**
 * Vérifie que les boutons OAuth NE sont PAS rendus (commentés dans le code).
 * Ce test confirme que le placeholder OAuth est bien désactivé.
 */
test("OAuth buttons are NOT rendered (commented out in code)", async ({ page }) => {
  await page.goto("/sign-in");

  // OAuth buttons should not be in the DOM since they're inside JSX comment block
  await expect(page.getByRole("button", { name: /google/i })).not.toBeVisible();
  await expect(page.getByRole("button", { name: /github/i })).not.toBeVisible();
  await expect(page.getByRole("button", { name: /apple/i })).not.toBeVisible();
});

/**
 * Vérifie le toggle sign-in / sign-up.
 */
test("can switch between sign-in and sign-up modes", async ({ page }) => {
  await page.goto("/sign-in");

  // Toggle to sign-up
  await page.getByText(/pas encore de compte/i).click();
  await expect(page.getByRole("heading", { name: /créer un compte/i })).toBeVisible();
  await expect(page.getByLabel(/nom/i)).toBeVisible();

  // Toggle back to sign-in
  await page.getByText(/déjà un compte/i).click();
  await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
});

/**
 * Vérifie que le middleware redirige vers /sign-in (route /collections).
 * Ce test ne nécessite pas d'authentification — juste la vérification middleware.
 */
test("unauthenticated user redirected to sign-in from /collections", async ({ page }) => {
  await page.goto("/collections");
  await expect(page).toHaveURL(/\/sign-in/);
});

/**
 * Vérifie que /settings redirige vers /sign-in.
 */
test("unauthenticated user redirected to sign-in from /settings", async ({ page }) => {
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/sign-in/);
});

/**
 * Vérifie que /browse est accessible sans authentification.
 */
test("browse page accessible without auth", async ({ page }) => {
  await page.goto("/browse");

  await expect(page).toHaveURL(/\/browse/);
  await expect(page.getByRole("heading", { name: /collections publiques/i })).toBeVisible();
});

/**
 * OAuth sign-in flows — skipped because OAuth credentials not configured.
 * Uncomment and configure env vars to enable:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 *   APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY
 */
test.skip("OAuth: sign-in page renders OAuth buttons", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /github/i })).toBeVisible();
});

test.skip("OAuth: complete Google sign-in flow", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: /google/i }).click();
  // Playwright will redirect to Google's OAuth consent page
  // This test requires real credentials and network access to Google
});
