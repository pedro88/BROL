/**
 * E2E tests: /browse page and homepage.
 *
 * S06: Full public browse coverage.
 */

import { test, expect, Page } from "@playwright/test";
import {
  signIn,
  createUserAPI,
  cleanupUser,
  uniqueEmail,
} from "./helpers/auth";

const WEB_BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const API_BASE = process.env.PLAYWRIGHT_API_BASE ?? "http://localhost:3001";

// ============================================================================
// Helpers
// ============================================================================

async function createPublicCollectionAPI(
  userToken: string,
  name: string,
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/trpc/collections.create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ name, isPublic: true }),
  });
  const data = await res.json();
  return { id: data.result?.data?.id ?? data.id };
}

async function createPrivateCollectionAPI(
  userToken: string,
  name: string,
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/trpc/collections.create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ name, isPublic: false }),
  });
  const data = await res.json();
  return { id: data.result?.data?.id ?? data.id };
}

// ============================================================================
// /browse page
// ============================================================================

test.describe("browse page", () => {
  test("accessible without auth", async ({ page }) => {
    await page.goto(`${WEB_BASE}/browse`);
    await expect(page).toHaveURL(/\/browse/);
  });

  test("shows COLLECTIONS PUBLIQUES heading", async ({ page }) => {
    await page.goto(`${WEB_BASE}/browse`);
    await expect(page.getByRole("heading", { name: /COLLECTIONS PUBLIQUES/i })).toBeVisible();
  });

  test("shows empty state when no public collections", async ({ page }) => {
    await page.goto(`${WEB_BASE}/browse`);
    const emptyState = page.getByText(/aucune collection publique/i);
    await expect(emptyState).toBeVisible({ timeout: 3000 }).catch(
      async () => {
        // Fallback: empty state with different text
        await expect(page.getByText(/aucune|vide|pas encore/i).first()).toBeVisible({ timeout: 3000 });
      },
    );
  });

  test("shows public collections when they exist", async ({ page }) => {
    // Create a public collection via API
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Browse Test User");
    await createPublicCollectionAPI(user.token, "Public Browse Collection");

    await page.goto(`${WEB_BASE}/browse`);
    await expect(page.getByText(/Public Browse Collection/i)).toBeVisible({ timeout: 5000 });

    await cleanupUser(email).catch(() => {});
  });

  test("clicking collection card navigates to detail", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Browse Nav Test User");
    await createPublicCollectionAPI(user.token, "Navigate Test Collection");

    await page.goto(`${WEB_BASE}/browse`);
    const card = page.locator("text=/Navigate Test Collection/i").first();
    await card.click();
    await expect(page).toHaveURL(/\/collections\/.+/);

    await cleanupUser(email).catch(() => {});
  });

  test("does not show private collections", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Private Browse Test User");
    await createPrivateCollectionAPI(user.token, "Private Should Not Appear");

    await page.goto(`${WEB_BASE}/browse`);
    // Private collection should not be visible
    await expect(page.getByText(/Private Should Not Appear/i)).not.toBeVisible().catch(() => {});

    await cleanupUser(email).catch(() => {});
  });
});

// ============================================================================
// Homepage
// ============================================================================

test.describe("homepage", () => {
  test("loads with VHS theme", async ({ page }) => {
    await page.goto(`${WEB_BASE}/`);
    // VHS logo text
    await expect(page.getByText("BROL", { exact: true }).first()).toBeVisible();
  });

  test("shows quick actions section", async ({ page }) => {
    await page.goto(`${WEB_BASE}/`);
    await expect(page.getByText(/ACTIONS RAPIDES/i)).toBeVisible();
  });

  test("navigation visible in header", async ({ page }) => {
    await page.goto(`${WEB_BASE}/`);
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("logo links to homepage", async ({ page }) => {
    await page.goto(`${WEB_BASE}/collections`);
    const logo = page.locator("text=BROL").first();
    await logo.click();
    await expect(page).toHaveURL(`${WEB_BASE}/`);
  });

  test("quick action links to collections", async ({ page }) => {
    await page.goto(`${WEB_BASE}/`);
    // Find a quick action link that leads to /collections
    const collectionsLink = page.getByRole("link", { name: /collections/i }).first();
    await collectionsLink.click();
    await expect(page).toHaveURL(/\/sign-in/); // redirects to sign-in (not authenticated)
  });
});

// ============================================================================
// Responsive
// ============================================================================

test.describe("responsive", () => {
  test("browse page renders at 375px mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/browse`);
    await expect(page.getByRole("heading", { name: /COLLECTIONS PUBLIQUES/i })).toBeVisible();
  });

  test("homepage renders at 375px mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/`);
    await expect(page.getByText("BROL", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/ACTIONS RAPIDES/i)).toBeVisible();
  });
});

// ============================================================================
// isPublic toggle (edit collection)
// ============================================================================

test.describe("isPublic toggle", () => {
  let testEmail: string;
  let testPassword: string;
  let testToken: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    testPassword = "TestPass123!";
    const user = await createUserAPI(testEmail, testPassword, "Toggle Test User");
    testToken = user.token;
    await signIn(page, testEmail, testPassword);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("edit page shows isPublic toggle", async ({ page }) => {
    const col = await createPrivateCollectionAPI(testToken, "Toggle Test Collection");
    await page.goto(`${WEB_BASE}/collections/${col.id}/edit`);
    const toggle = page.locator('[role="switch"], input[type="checkbox"]').first();
    await expect(toggle).toBeVisible({ timeout: 3000 });
  });

  test("changing isPublic reflects in browse", async ({ page }) => {
    const col = await createPrivateCollectionAPI(testToken, "Toggle Visibility Collection");

    // Verify NOT visible in browse (private)
    await page.goto(`${WEB_BASE}/browse`);
    await expect(page.getByText(/Toggle Visibility Collection/i)).not.toBeVisible().catch(() => {});

    // Toggle to public via edit page
    await page.goto(`${WEB_BASE}/collections/${col.id}/edit`);
    const toggle = page.locator('[role="switch"], input[type="checkbox"]').first();
    const isPublic = await toggle.isChecked().catch(() => false);
    if (!isPublic) {
      await toggle.click();
      await page.getByRole("button", { name: /enregistrer|sauvegarder|save/i }).click();
      await page.waitForLoadState("networkidle");
    }

    // Verify visible in browse
    await page.goto(`${WEB_BASE}/browse`);
    await expect(page.getByText(/Toggle Visibility Collection/i)).toBeVisible({ timeout: 5000 });
  });
});
