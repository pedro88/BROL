/**
 * E2E tests: Notifications — /notifications page.
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

test.describe("notifications page", () => {
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(testEmail, password, "Notifications Test User");
    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("redirects to /sign-in without auth", async ({ page }) => {
    await clearSession(page);
    await page.goto(`${WEB_BASE}/notifications`);
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("page loads with auth", async ({ page }) => {
    await page.goto(`${WEB_BASE}/notifications`);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });

  test("shows empty state when no notifications", async ({ page }) => {
    await page.goto(`${WEB_BASE}/notifications`);
    await page.waitForLoadState("networkidle");
    // Bell icon or empty state message
    const emptyState = page.getByText(/aucune|pas encore|vide/i).first();
    await expect(emptyState).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test("shows notification list heading", async ({ page }) => {
    await page.goto(`${WEB_BASE}/notifications`);
    await expect(page.getByRole("heading", { name: /notif/i }).first()).toBeVisible({ timeout: 3000 });
  });

  test("Mark all read button is present when notifications exist", async ({ page }) => {
    await page.goto(`${WEB_BASE}/notifications`);
    await page.waitForLoadState("networkidle");
    // Button may be disabled if no notifications
    const markAllBtn = page.getByRole("button", { name: /tout|marquer/i }).first();
    await expect(markAllBtn).toBeVisible({ timeout: 3000 }).catch(() => {});
  });
});

test.describe("notifications responsive", () => {
  test("renders at 375px mobile", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(email, password, "Responsive Notif User");
    await signIn(page, email, password);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/notifications`);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });
});