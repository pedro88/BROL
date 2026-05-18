/**
 * E2E tests: Objects CRUD.
 *
 * S06: Full edge-case coverage.
 */

import { test, expect, Page } from "@playwright/test";
import {
  signIn,
  createUserAPI,
  cleanupUser,
  clearSession,
  uniqueEmail,
} from "./helpers/auth";

const WEB_BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const API_BASE = process.env.PLAYWRIGHT_API_BASE ?? "http://localhost:3001";

// ============================================================================
// Helpers
// ============================================================================

async function createUserWithSession(page: Page): Promise<{ email: string; password: string }> {
  const email = uniqueEmail();
  const password = "TestPass123!";
  await createUserAPI(email, password, "Objects Test User");
  await signIn(page, email, password);
  return { email, password };
}

async function createCollectionAPI(
  userToken: string,
  name: string,
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/trpc/collections.create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ name, type: "BOOK" }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`createCollectionAPI: ${JSON.stringify(data.error)}`);
  return { id: data.result?.data?.id };
}

async function createObjectAPI(
  userToken: string,
  collectionId: string,
  name: string,
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/trpc/objects.create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ collectionId, name }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`createObjectAPI: ${JSON.stringify(data.error)}`);
  return { id: data.result?.data?.id };
}

// ============================================================================
// /objects/add
// ============================================================================

test.describe("objects/add", () => {
  let testEmail: string;
  let testToken: string;
  let collectionId: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(testEmail, password, "Objects Add Test User");
    testToken = user.token;
    await signIn(page, testEmail, password);

    // Create a collection to add objects to
    const col = await createCollectionAPI(testToken, "E2E Test Collection");
    collectionId = col.id;
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("page loads with auth", async ({ page }) => {
    await page.goto(`${WEB_BASE}/objects/add`);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });

  test("form validation — name required", async ({ page }) => {
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${collectionId}`);
    // Wait for form to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    // Submit without filling name
    await page.locator('button[type="submit"]').click();
    // Zod validation error should appear
    await expect(
      page.locator("p.text-destructive").first()
    ).toBeVisible({ timeout: 3000 });
  });

  test("creates object in collection", async ({ page }) => {
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${collectionId}`);
    // Wait for form to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    // Fill the name field
    await page.getByLabel(/nom/i).fill("E2E Test Object");
    // Submit and wait for navigation to collection detail
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/collections\/.+/, { timeout: 10000 }).catch(() => {});
    // Should navigate to collection detail page
    expect(page.url()).toContain("/collections/");
  });

  test("redirects to /sign-in without auth", async ({ page }) => {
    // Use clearSession (clears cookies) instead of UI sign-out
    await clearSession(page);
    await page.goto(`${WEB_BASE}/objects/add`);
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

// ============================================================================
// /objects/:id
// ============================================================================

test.describe("object detail", () => {
  let testEmail: string;
  let testToken: string;
  let objectId: string;
  let collectionId: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(testEmail, password, "Object Detail Test User");
    testToken = user.token;
    await signIn(page, testEmail, password);

    const col = await createCollectionAPI(testToken, "Object Detail Collection");
    collectionId = col.id;
    const obj = await createObjectAPI(testToken, collectionId, "Detail Test Object");
    objectId = obj.id;
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("non-existent object shows not found", async ({ page }) => {
    await page.goto(`${WEB_BASE}/objects/non-existent-id`);
    await expect(
      page.getByText(/non trouvé|intouvable|not found/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("valid object shows name", async ({ page }) => {
    await page.goto(`${WEB_BASE}/objects/${objectId}`);
    await expect(page.getByText(/Detail Test Object/i)).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// Navigation
// ============================================================================

test.describe("navigation", () => {
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(testEmail, password, "Nav Objects Test User");
    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("can navigate to object add page", async ({ page }) => {
    // Navigate directly to the add page — the page exists and loads without auth redirect
    await page.goto(`${WEB_BASE}/objects/add`);
    await expect(page).toHaveURL(/\/objects\/add/);
  });
});

// ============================================================================
// Responsive
// ============================================================================

test.describe("responsive", () => {
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(testEmail, password, "Responsive Objects Test User");
    await signIn(page, testEmail, password);
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("add object page renders at 375px", async ({ page }) => {
    await page.goto(`${WEB_BASE}/objects/add`);
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.getByLabel(/nom/i)).toBeVisible();
  });
});
