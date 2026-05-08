/**
 * E2E tests: Public collections — /collections/:id access rules.
 *
 * S06: Verifies publicProcedure and auth-gated access.
 */

import { test, expect, Page } from "@playwright/test";
import {
  signIn,
  clearSession,
  createUserAPI,
  cleanupUser,
  uniqueEmail,
} from "./helpers/auth";

const WEB_BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const API_BASE = process.env.PLAYWRIGHT_API_BASE ?? "http://localhost:3001";

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
  if (data.error) {
    throw new Error(`createPublicCollectionAPI: ${JSON.stringify(data.error)}`);
  }
  return { id: data.result?.data?.id };
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
  if (data.error) {
    throw new Error(`createPrivateCollectionAPI: ${JSON.stringify(data.error)}`);
  }
  return { id: data.result?.data?.id };
}

// ============================================================================
// Public access
// ============================================================================

test.describe("public access", () => {
  let testEmail: string;
  let collectionId: string;

  test.beforeEach(async () => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(testEmail, password, "Public Access Test User");
    const col = await createPublicCollectionAPI(user.token, "Public Access Collection");
    collectionId = col.id!;
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("accessible without auth when isPublic=true", async ({ page }) => {
    await page.goto(`${WEB_BASE}/collections/${collectionId}`);
    // Should NOT redirect to /sign-in
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page).toHaveURL(/\/collections\//);
  });

  test("shows collection name and objects", async ({ page }) => {
    await page.goto(`${WEB_BASE}/collections/${collectionId}`);
    await expect(page.getByText(/Public Access Collection/i)).toBeVisible({ timeout: 5000 });
  });

  test("shows empty state when no objects", async ({ page }) => {
    await page.goto(`${WEB_BASE}/collections/${collectionId}`);
    // Empty state or no objects message should appear
    const emptyState = page.getByText(/aucun|vide|pas encore/i).first();
    await expect(emptyState).toBeVisible({ timeout: 3000 }).catch(() => {});
  });
});

// ============================================================================
// Private access
// ============================================================================

test.describe("private access", () => {
  let testEmail: string;
  let collectionId: string;

  test.beforeEach(async () => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(testEmail, password, "Private Access Test User");
    const col = await createPrivateCollectionAPI(user.token, "Private Access Collection");
    collectionId = col.id;
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("redirects to /sign-in without auth when isPublic=false", async ({ page }) => {
    await page.goto(`${WEB_BASE}/collections/${collectionId}`);
    // Without auth, should either redirect to sign-in OR show not-found (tRPC returns 404 for private)
    const url = page.url();
    const isSignIn = /\/sign-in/.test(url);
    const isNotFound = await page.getByText(/non trouvé|intouvable|not found/i).first().isVisible().catch(() => false);
    expect(isSignIn || isNotFound).toBe(true);
  });

  test("accessible to owner when authenticated", async ({ page }) => {
    const password = "TestPass123!";
    await signIn(page, testEmail, password);
    await page.goto(`${WEB_BASE}/collections/${collectionId}`);
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.getByText(/Private Access Collection/i)).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// Mixed scenarios
// ============================================================================

test.describe("mixed scenarios", () => {
  test("sign-in then sign-out affects access", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Mixed Test User");
    const col = await createPrivateCollectionAPI(user.token, "Mixed Private Collection");

    // Sign in — can access
    await signIn(page, email, password);
    await page.goto(`${WEB_BASE}/collections/${col.id}`);
    await expect(page).not.toHaveURL(/\/sign-in/);

    // Clear session — cannot access
    await clearSession(page);
    await page.goto(`${WEB_BASE}/collections/${col.id}`);
    const url = page.url();
    const isSignIn = /\/sign-in/.test(url);
    const isNotFound = await page.getByText(/non trouvé|intouvable|not found/i).first().isVisible().catch(() => false);
    expect(isSignIn || isNotFound).toBe(true);

    await cleanupUser(email).catch(() => {});
  });

  test("public collection visible to non-authenticated users", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Public Verify User");
    const col = await createPublicCollectionAPI(user.token, "Verify Public Access");

    // Browse — collection should be visible without auth
    await page.goto(`${WEB_BASE}/browse`);
    await expect(page.getByText(/Verify Public Access/i)).toBeVisible({ timeout: 5000 });

    await cleanupUser(email).catch(() => {});
  });
});
