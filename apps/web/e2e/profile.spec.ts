/**
 * E2E tests: Public profile — /profile/[id].
 *
 * M014: Profil, Notifications, Tiers et Badges
 */

import { test, expect } from "@playwright/test";
import {
  signIn,
  clearSession,
  createUserAPI,
  cleanupUser,
  uniqueEmail,
} from "./helpers/auth";

const WEB_BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const API_BASE = process.env.PLAYWRIGHT_API_BASE ?? "http://localhost:3001";

test.describe("profile page", () => {
  test("non-existent profile shows PROFIL INTROUVABLE", async ({ page }) => {
    await page.goto(`${WEB_BASE}/profile/non-existent-profile-id`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/introvable|not found/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("valid profile shows user name", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Profile Test User");

    await page.goto(`${WEB_BASE}/profile/${user.user.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Profile Test User/i).first()).toBeVisible({ timeout: 5000 });

    await cleanupUser(email).catch(() => {});
  });

  test("shows Membre depuis date", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Date Member User");

    await page.goto(`${WEB_BASE}/profile/${user.user.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/membre/i).first()).toBeVisible({ timeout: 5000 });

    await cleanupUser(email).catch(() => {});
  });

  test("shows stats section (avis count, badges)", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Stats Profile User");

    await page.goto(`${WEB_BASE}/profile/${user.user.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/avis|badges/i).first()).toBeVisible({ timeout: 3000 });

    await cleanupUser(email).catch(() => {});
  });

  test("shows BADGES section", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Badges Profile User");

    await page.goto(`${WEB_BASE}/profile/${user.user.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /BADGES/i }).first()).toBeVisible({ timeout: 3000 });

    await cleanupUser(email).catch(() => {});
  });

  test("shows AVIS section", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Reviews Profile User");

    await page.goto(`${WEB_BASE}/profile/${user.user.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /AVIS/i }).first()).toBeVisible({ timeout: 3000 });

    await cleanupUser(email).catch(() => {});
  });
});

test.describe("profile page responsive", () => {
  test("renders at 375px mobile", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Mobile Profile User");

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/profile/${user.user.id}`);
    await expect(page.getByText(/Profile User/i).first()).toBeVisible({ timeout: 5000 });

    await cleanupUser(email).catch(() => {});
  });
});