/**
 * E2E tests: user public handle (#piet1234) + QR add-friend flow.
 *
 * Covers:
 * - Settings page shows the current user's handle and QR toggle.
 * - Borrower-select dialog "ID / QR" tab resolves a Brol user by handle.
 * - Same tab resolves a user by raw cuid (backwards-compat with old IDs).
 * - Unknown handle shows the not-found message.
 * - Handle prefixed with "#" works (the server strips it).
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

async function fetchHandle(token: string): Promise<string> {
  // Poll users.me until the BetterAuth databaseHooks.user.create.after has
  // written the handle (it runs *after* sign-up returns, so it may not be
  // populated on the very first request).
  for (let i = 0; i < 10; i++) {
    const res = await fetch(`${API_BASE}/api/trpc/users.me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      const handle = data?.result?.data?.handle as string | null | undefined;
      if (handle) return handle;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Handle was never generated for user");
}

async function createCollectionAPI(token: string, name: string): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/trpc/collections.create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, isPublic: false, type: "BOOK" }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`createCollectionAPI: ${JSON.stringify(data.error)}`);
  return { id: data.result?.data?.id };
}

async function createObjectAPI(
  token: string,
  collectionId: string,
  name: string,
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/trpc/objects.create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ collectionId, name, type: "BOOK", condition: "GOOD" }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`createObjectAPI: ${JSON.stringify(data.error)}`);
  return { id: data.result?.data?.id };
}

async function openBorrowerDialog(page: Page, objectId: string) {
  await page.goto(`${WEB_BASE}/objects/${objectId}`);
  await page.waitForLoadState("networkidle");
  // Step 1: click the "Prêter cet objet" button on the object page → CreateLoanDialog.
  await page
    .getByRole("button", { name: /prêter cet objet/i })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: /prêter cet objet/i }),
  ).toBeVisible({ timeout: 3000 });
  // Step 2: open the nested BorrowerSelectDialog.
  await page
    .getByRole("button", { name: /ajouter un emprunteur/i })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: /ajouter un emprunteur/i }),
  ).toBeVisible({ timeout: 3000 });
}

async function switchToIdQrTab(page: Page) {
  await page.getByRole("button", { name: /^id\s*\/\s*qr$/i }).click();
  await expect(page.getByLabel(/identifiant ou id/i)).toBeVisible({ timeout: 2000 });
}

// ============================================================================
// Settings page — handle + QR display
// ============================================================================

test.describe("settings page — handle + QR", () => {
  let ownerEmail: string;
  let ownerToken: string;
  let ownerHandle: string;

  test.beforeEach(async ({ page }) => {
    ownerEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(ownerEmail, password, "Handle Owner");
    ownerToken = user.token;
    ownerHandle = await fetchHandle(ownerToken);
    await signIn(page, ownerEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(ownerEmail).catch(() => {});
  });

  test("settings shows current user's handle with # prefix", async ({ page }) => {
    await page.goto(`${WEB_BASE}/settings`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/MON PROFIL/)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(`#${ownerHandle}`).first()).toBeVisible({ timeout: 5000 });
  });

  test("QR toggle reveals a QR image encoding the profile URL", async ({ page }) => {
    await page.goto(`${WEB_BASE}/settings`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /afficher le qr code/i }).click();
    const qrImg = page.locator(`img[alt*="${ownerHandle}"]`).first();
    await expect(qrImg).toBeVisible({ timeout: 3000 });
    const alt = await qrImg.getAttribute("alt");
    expect(alt).toContain("/profile/");
    expect(alt).toContain(ownerHandle);
  });
});

// ============================================================================
// Borrower-select dialog — ID / QR lookup
// ============================================================================

test.describe("borrower-select dialog — ID/handle lookup", () => {
  let ownerEmail: string;
  let ownerToken: string;
  let targetEmail: string;
  let targetUserId: string;
  let targetHandle: string;
  let objectId: string;

  test.beforeEach(async ({ page }) => {
    const password = "TestPass123!";

    // Owner (the user creating the loan).
    ownerEmail = uniqueEmail();
    const owner = await createUserAPI(ownerEmail, password, "Loan Owner");
    ownerToken = owner.token;
    const col = await createCollectionAPI(ownerToken, "Handle Test Collection");
    const obj = await createObjectAPI(ownerToken, col.id, "Lendable Book");
    objectId = obj.id;

    // Target (the user being added by handle/QR).
    targetEmail = uniqueEmail();
    const target = await createUserAPI(targetEmail, password, "Target Friend");
    targetUserId = target.user.id;
    targetHandle = await fetchHandle(target.token);

    await signIn(page, ownerEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(ownerEmail).catch(() => {});
    await cleanupUser(targetEmail).catch(() => {});
  });

  test("typing a bare handle (piet1234) resolves the user", async ({ page }) => {
    await openBorrowerDialog(page, objectId);
    await switchToIdQrTab(page);

    await page.getByLabel(/identifiant ou id/i).fill(targetHandle);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Target Friend")).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByRole("button", { name: /sélectionner cet utilisateur/i }),
    ).toBeVisible();
  });

  test('typing a "#"-prefixed handle (#piet1234) resolves the user', async ({ page }) => {
    await openBorrowerDialog(page, objectId);
    await switchToIdQrTab(page);

    await page.getByLabel(/identifiant ou id/i).fill(`#${targetHandle}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Target Friend")).toBeVisible({ timeout: 5000 });
  });

  test("typing a raw cuid still resolves the user (backwards-compat)", async ({ page }) => {
    await openBorrowerDialog(page, objectId);
    await switchToIdQrTab(page);

    await page.getByLabel(/identifiant ou id/i).fill(targetUserId);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Target Friend")).toBeVisible({ timeout: 5000 });
  });

  test("typing an unknown handle shows the not-found message", async ({ page }) => {
    await openBorrowerDialog(page, objectId);
    await switchToIdQrTab(page);

    await page.getByLabel(/identifiant ou id/i).fill("doesnotexist9999");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(/aucun utilisateur trouvé/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("selecting the resolved user closes the dialog", async ({ page }) => {
    await openBorrowerDialog(page, objectId);
    await switchToIdQrTab(page);

    await page.getByLabel(/identifiant ou id/i).fill(targetHandle);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /sélectionner cet utilisateur/i }).click();

    // After select, the borrower-select dialog closes — the loan-create
    // dialog remains visible (now with the selected borrower).
    await expect(
      page.getByText(/ajouter un emprunteur/i),
    ).not.toBeVisible({ timeout: 3000 });
  });
});
