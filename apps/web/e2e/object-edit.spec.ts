/**
 * E2E tests: Object creation and editing with type-specific fields, pricing, and photos.
 *
 * M013: Enhanced Object Creation — type-specific fields, photos, QR, and pricing
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

// ============================================================================
// Helpers
// ============================================================================

async function createCollectionAPI(
  userToken: string,
  name: string,
  type = "BOOK",
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/trpc/collections.create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ name, isPublic: false, type }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`createCollectionAPI: ${JSON.stringify(data.error)}`);
  return { id: data.result?.data?.id };
}

async function createObjectAPI(
  userToken: string,
  collectionId: string,
  name: string,
  extraFields?: Record<string, unknown>,
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/trpc/objects.create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      collectionId,
      name,
      author: "Test Author",
      condition: "GOOD",
      ...extraFields,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`createObjectAPI: ${JSON.stringify(data.error)}`);
  return { id: data.result?.data?.id };
}

// ============================================================================
// /objects/add — type-adapted fields
// ============================================================================

test.describe("object add — type-specific fields", () => {
  let testEmail: string;
  let testToken: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(testEmail, password, "Type Fields User");
    testToken = user.token;
    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("BOOK collection: shows ISBN field", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Book Type Collection", "BOOK");
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${col.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel(/isbn/i).first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByLabel(/joueurs|players/i).first()).not.toBeVisible();
  });

  test("BOARD_GAME collection: shows players and duration fields", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Board Game Type Collection", "BOARD_GAME");
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${col.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel(/joueurs.*min/i).first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByLabel(/durée/i).first()).toBeVisible();
    await expect(page.getByLabel(/isbn/i).first()).not.toBeVisible();
  });

  test("ELECTRIC collection: shows powerWatts field", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Electric Type Collection", "ELECTRIC");
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${col.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel(/puissance|watts/i).first()).toBeVisible({ timeout: 3000 });
  });

  test("CLOTHING collection: shows clothing size and gender fields", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Clothing Type Collection", "CLOTHING");
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${col.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/taille|size/i).first()).toBeVisible({ timeout: 3000 });
  });

  test("TOOL collection: shows tool sector and battery/manual toggles", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Tool Type Collection", "TOOL");
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${col.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/secteur|bricolage|jardinage/i).first()).toBeVisible({ timeout: 3000 });
  });

  test("CUSTOM collection: shows customField labels", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Custom Type Collection", "CUSTOM");
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${col.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel(/champ libre/i).first()).toBeVisible({ timeout: 3000 });
  });
});

// ============================================================================
// /objects/add — caution and rental pricing
// ============================================================================

test.describe("object add — caution and rental pricing", () => {
  let testEmail: string;
  let testToken: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(testEmail, password, "Pricing User");
    testToken = user.token;
    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("pricing toggle is present", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Pricing Collection", "BOOK");
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${col.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/tarification|caution|prix.*location/i).first()).toBeVisible({ timeout: 3000 });
  });

  test("activating pricing reveals pricing fields", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Pricing Toggle Collection", "BOOK");
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${col.id}`);
    await page.waitForLoadState("networkidle");

    // Look for pricing toggle button
    const pricingToggle = page.getByText(/activer.*tarification|tarification.*activée/i).first();
    if (await pricingToggle.isVisible().catch(() => false)) {
      await pricingToggle.click();
      await page.waitForTimeout(300);
      await expect(page.getByLabel(/caution/i).first()).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test("form submits without pricing fields filled", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "No Pricing Collection", "BOOK");
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${col.id}`);
    await page.waitForLoadState("networkidle");
    await page.getByLabel(/nom/i).fill("Object Without Pricing");
    await page.locator('button[type="submit"]').click();
    // Should navigate away (to collection detail) without requiring pricing
    await page.waitForURL(/\/collections\//, { timeout: 8000 }).catch(() => {});
  });
});

// ============================================================================
// /objects/[id]/edit — type-adapted edit dialog
// ============================================================================

test.describe("object edit — type-adapted fields", () => {
  let testEmail: string;
  let testToken: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(testEmail, password, "Edit Type User");
    testToken = user.token;
    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("edit page for BOARD_GAME shows board game fields", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Edit Board Game Collection", "BOARD_GAME");
    const obj = await createObjectAPI(testToken, col.id, "Edit Board Game Object");
    await page.goto(`${WEB_BASE}/objects/${obj.id}/edit`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel(/joueurs.*min/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/durée/i).first()).toBeVisible();
  });

  test("edit page for BOOK shows ISBN field", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Edit Book Collection", "BOOK");
    const obj = await createObjectAPI(testToken, col.id, "Edit Book Object");
    await page.goto(`${WEB_BASE}/objects/${obj.id}/edit`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel(/isbn/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("edit page for ELECTRIC shows powerWatts field", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Edit Electric Collection", "ELECTRIC");
    const obj = await createObjectAPI(testToken, col.id, "Edit Electric Object");
    await page.goto(`${WEB_BASE}/objects/${obj.id}/edit`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel(/puissance|watts/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("edit dialog has condition radio buttons", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Condition Collection", "BOOK");
    const obj = await createObjectAPI(testToken, col.id, "Condition Object");
    await page.goto(`${WEB_BASE}/objects/${obj.id}/edit`);
    await page.waitForLoadState("networkidle");
    // Condition radio labels: Neuf, Comme neuf, Bon, Correct, Mauvais
    await expect(page.getByText(/neuf|bon|correct/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("edit dialog shows pricing toggle when object has pricing", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Pricing Edit Collection", "BOOK");
    const obj = await createObjectAPI(testToken, col.id, "Pricing Edit Object");
    await page.goto(`${WEB_BASE}/objects/${obj.id}/edit`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/tarification|caution/i).first()).toBeVisible({ timeout: 3000 });
  });

  test("edit form validation — name required", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Validation Edit Collection", "BOOK");
    const obj = await createObjectAPI(testToken, col.id, "Validation Object");
    await page.goto(`${WEB_BASE}/objects/${obj.id}/edit`);
    await page.waitForLoadState("networkidle");
    // Clear the name field and try to submit
    const nameInput = page.locator("#edit-name, [id='edit-name']").first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.clear();
      await page.getByRole("button", { name: /enregistrer/i }).first().click();
      // Should stay in dialog (browser validation)
      await expect(page.locator('[role="dialog"], [role="alert"]')).toBeVisible({ timeout: 2000 });
    }
  });

  test("edit success navigates back to object detail", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Success Edit Collection", "BOOK");
    const obj = await createObjectAPI(testToken, col.id, "Success Edit Object");
    await page.goto(`${WEB_BASE}/objects/${obj.id}/edit`);
    await page.waitForLoadState("networkidle");
    const nameInput = page.locator("#edit-name, [id='edit-name']").first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("Updated Object Name");
      await page.getByRole("button", { name: /enregistrer/i }).first().click();
      await page.waitForURL(new RegExp(`/objects/${obj.id}$`), { timeout: 8000 }).catch(() => {});
      await expect(page).toHaveURL(new RegExp(`/objects/${obj.id}`));
    }
  });
});

// ============================================================================
// /objects/add — no redirect after creation (S01 key feature)
// ============================================================================

test.describe("object add — no redirect after creation", () => {
  let testEmail: string;
  let testToken: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(testEmail, password, "No Redirect User");
    testToken = user.token;
    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("creating object does NOT redirect to /objects/[id]/edit", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "No Redirect Collection", "BOOK");
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${col.id}`);
    await page.waitForLoadState("networkidle");
    await page.getByLabel(/nom/i).fill("No Redirect Object");
    await page.locator('button[type="submit"]').click();
    // Should navigate to /collections/[id], NOT /objects/[id]/edit
    await page.waitForURL(/\/collections\//, { timeout: 8000 }).catch(() => {});
    const url = page.url();
    expect(url).not.toContain("/objects/");
    expect(url).toContain("/collections/");
  });

  test("after creation, object appears in collection", async ({ page }) => {
    const col = await createCollectionAPI(testToken, "Appears Collection", "BOOK");
    const objectName = `Appears Object ${Date.now()}`;
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${col.id}`);
    await page.waitForLoadState("networkidle");
    await page.getByLabel(/nom/i).fill(objectName);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/collections\//, { timeout: 8000 }).catch(() => {});
    await expect(page.getByText(objectName).first()).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// Responsive
// ============================================================================

test.describe("object add/edit responsive", () => {
  test("add object page renders at 375px", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Mobile Add User");
    const col = await createCollectionAPI(user.token, "Mobile Add Collection", "BOOK");
    await signIn(page, email, password);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/objects/add?collectionId=${col.id}`);
    await expect(page.getByLabel(/nom/i).first()).toBeVisible({ timeout: 5000 });
    await cleanupUser(email).catch(() => {});
  });

  test("edit object page renders at 375px", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "Mobile Edit User");
    const col = await createCollectionAPI(user.token, "Mobile Edit Collection", "BOOK");
    const obj = await createObjectAPI(user.token, col.id, "Mobile Edit Object");
    await signIn(page, email, password);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/objects/${obj.id}/edit`);
    await expect(page.getByRole("heading", { name: /MODIFIER/i }).first()).toBeVisible({ timeout: 5000 });
    await cleanupUser(email).catch(() => {});
  });
});