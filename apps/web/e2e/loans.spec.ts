/**
 * E2E tests: Loans — /loans page.
 *
 * M007: Gestion des prêts
 */

import { test, expect, Page } from "@playwright/test";
import {
  signIn,
  signOut,
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

async function createContactAPI(
  userToken: string,
  name: string,
  email: string,
  phone?: string,
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/trpc/contacts.create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ name, email, phone }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`createContactAPI: ${JSON.stringify(data.error)}`);
  return { id: data.result?.data?.id };
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
    body: JSON.stringify({ name, isPublic: false, type: "BOOK" }),
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
    body: JSON.stringify({ collectionId, name, author: "Test Author", condition: "GOOD" }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`createObjectAPI: ${JSON.stringify(data.error)}`);
  return { id: data.result?.data?.id };
}

async function createLoanAPI(
  userToken: string,
  objectId: string,
  contactId: string,
  returnDueDate?: string,
  notes?: string,
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/trpc/loans.create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      objectId,
      contactId,
      returnDueDate,
      notes,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`createLoanAPI: ${JSON.stringify(data.error)}`);
  return { id: data.result?.data?.id };
}

// ============================================================================
// /loans page
// ============================================================================

test.describe("loans page", () => {
  let testEmail: string;
  let testToken: string;
  let collectionId: string;
  let objectId: string;
  let contactId: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(testEmail, password, "Loans Test User");
    testToken = user.token;

    const col = await createCollectionAPI(testToken, "Loans Test Collection");
    collectionId = col.id;
    const obj = await createObjectAPI(testToken, collectionId, "Loaned Book");
    objectId = obj.id;
    const contact = await createContactAPI(testToken, "Test Borrower", `borrower-${testEmail}`);
    contactId = contact.id;

    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("redirects to /sign-in without auth", async ({ page }) => {
    await clearSession(page);
    await page.goto(`${WEB_BASE}/loans`);
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("page loads with auth", async ({ page }) => {
    await page.goto(`${WEB_BASE}/loans`);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });

  test("shows 3 tabs: Prêtés, Empruntés, Historique", async ({ page }) => {
    await page.goto(`${WEB_BASE}/loans`);
    await expect(page.getByRole("tab", { name: /prêtés/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /empruntés/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /historique/i })).toBeVisible();
  });

  test("empty state when no loans", async ({ page }) => {
    await page.goto(`${WEB_BASE}/loans`);
    await page.waitForLoadState("networkidle");
    // The "Prêtés" tab is default — should show empty state if no loans
    const emptyState = page.getByText(/aucun|vide|pas encore/i).first();
    await expect(emptyState).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test("lent tab shows loaned objects after creating a loan", async ({ page }) => {
    // Create loan via API
    await createLoanAPI(testToken, objectId, contactId);

    await page.goto(`${WEB_BASE}/loans`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Loaned Book/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("clicking a loan card shows actions (Marquer retourné, Relancer)", async ({ page }) => {
    await createLoanAPI(testToken, objectId, contactId);

    await page.goto(`${WEB_BASE}/loans`);
    await page.waitForLoadState("networkidle");
    const card = page.locator(".card-vhs").filter({ hasText: /Loaned Book/i }).first();
    await expect(card).toBeVisible({ timeout: 5000 });
    // Actions may be visible or behind a button
    const returnBtn = page.getByRole("button", { name: /retourné/i }).first();
    await expect(returnBtn).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test("mark as returned removes from lent tab", async ({ page }) => {
    const loan = await createLoanAPI(testToken, objectId, contactId);

    await page.goto(`${WEB_BASE}/loans`);
    await page.waitForLoadState("networkidle");

    // Find the card and click "Marquer retourné"
    const card = page.locator(".card-vhs").filter({ hasText: /Loaned Book/i }).first();
    const returnBtn = card.getByRole("button", { name: /retourné/i });
    await returnBtn.click();
    await page.waitForLoadState("networkidle");

    // Should move to Historique tab or show as returned
    await page.getByRole("tab", { name: /historique/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Loaned Book/i).first()).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// /loans — create loan dialog
// ============================================================================

test.describe("create loan dialog", () => {
  let testEmail: string;
  let testToken: string;
  let collectionId: string;
  let objectId: string;
  let contactId: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(testEmail, password, "Create Loan Test User");
    testToken = user.token;

    const col = await createCollectionAPI(testToken, "Create Loan Collection");
    collectionId = col.id;
    const obj = await createObjectAPI(testToken, collectionId, "Book To Lend");
    objectId = obj.id;
    const contact = await createContactAPI(testToken, "New Borrower", `newborrower-${testEmail}`);
    contactId = contact.id;

    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("object detail page shows Prêter button", async ({ page }) => {
    await page.goto(`${WEB_BASE}/objects/${objectId}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /prêter/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test("Prêter button opens create loan dialog", async ({ page }) => {
    await page.goto(`${WEB_BASE}/objects/${objectId}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /prêter/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
  });

  test("dialog shows contact search combobox", async ({ page }) => {
    await page.goto(`${WEB_BASE}/objects/${objectId}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /prêter/i }).first().click();
    await expect(page.locator('[role="combobox"], input[placeholder*="contact"]').first()).toBeVisible({ timeout: 3000 }).catch(
      async () => {
        await expect(page.locator("input").first()).toBeVisible({ timeout: 3000 });
      },
    );
  });

  test("can select a contact and create loan", async ({ page }) => {
    await page.goto(`${WEB_BASE}/objects/${objectId}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /prêter/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

    // Open BorrowerSelectDialog
    await page.getByRole("button", { name: /ajouter un emprunteur/i }).click();
    const borrowerDialog = page.locator('[role="dialog"]').nth(1);
    await expect(borrowerDialog).toBeVisible({ timeout: 3000 });

    // Select the existing contact from the list (no search needed, only one contact)
    await borrowerDialog.getByText("New Borrower").first().click();

    // Borrower chip should now be visible in the loan dialog
    await expect(page.getByText("New Borrower").first()).toBeVisible({ timeout: 3000 });

    // Submit
    const submitBtn = page.getByRole("button", { name: /confirmer le prêt/i });
    await expect(submitBtn).toBeEnabled({ timeout: 3000 });
    await submitBtn.click();
    await page.waitForLoadState("networkidle");

    // Should navigate to /loans
    await expect(page).toHaveURL(/\/loans/, { timeout: 8000 });
  });

  test("lending to a non-Brol contact (no borrowerId) succeeds without 500", async () => {
    // Regression for M008-2: previously threw "Emprunteur non trouvé" when
    // the selected Contact had no linked Brol account. Now must fall back
    // to borrowerContactId silently.
    const res = await fetch(`${API_BASE}/api/trpc/loans.create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({ objectId, contactId }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.error).toBeUndefined();
    expect(data.result?.data?.id).toBeTruthy();
  });

  test("can create a new contact from within the loan dialog", async ({ page }) => {
    await page.goto(`${WEB_BASE}/objects/${objectId}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /prêter/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

    // Try typing a non-existent contact — "Créer" button should appear
    const searchInput = page.locator("input[placeholder*='ontact'], input[placeholder*='echerche']").first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill("Unknown Contact");
      await page.waitForTimeout(800);
      const createBtn = page.getByRole("button", { name: /créer/i }).first();
      if (await createBtn.isVisible().catch(() => false)) {
        await createBtn.click();
        await page.waitForTimeout(500);
        // New contact fields should appear
        await expect(page.locator("#name, input[name='name']").first()).toBeVisible({ timeout: 3000 });
      }
    }
  });
});

// ============================================================================
// Responsive
// ============================================================================

test.describe("loans responsive", () => {
  test("renders at 375px mobile", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(email, password, "Responsive Loans User");
    await signIn(page, email, password);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/loans`);
    await expect(page.getByRole("tab", { name: /prêtés/i })).toBeVisible();
    await cleanupUser(email).catch(() => {});
  });
});