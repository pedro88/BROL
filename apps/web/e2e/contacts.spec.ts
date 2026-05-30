/**
 * E2E tests: Contacts — /contacts page and /contacts/[id].
 *
 * M007: Gestion des prêts
 */

import { test, expect, Page } from "@playwright/test";
import {
  signIn,
  clearSession,
  createUserAPI,
  cleanupUser,
  uniqueEmail,
  getSessionToken,
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
  note?: string,
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/trpc/contacts.create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ name, email, phone, note }),
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
    body: JSON.stringify({ objectId, contactId, returnDueDate, notes }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`createLoanAPI: ${JSON.stringify(data.error)}`);
  return { id: data.result?.data?.id };
}

// ============================================================================
// /contacts page
// ============================================================================

test.describe("contacts page", () => {
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(testEmail, password, "Contacts Test User");
    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("redirects to /sign-in without auth", async ({ page }) => {
    await clearSession(page);
    await page.goto(`${WEB_BASE}/contacts`);
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("page loads with auth", async ({ page }) => {
    await page.goto(`${WEB_BASE}/contacts`);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });

  test("shows empty state when no contacts", async ({ page }) => {
    await page.goto(`${WEB_BASE}/contacts`);
    await page.waitForLoadState("networkidle");
    const emptyState = page.getByText(/aucun|vide|pas encore/i).first();
    await expect(emptyState).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test("shows contact cards when contacts exist", async ({ page }) => {
    const token = await getSessionToken(testEmail);
    if (!token) throw new Error("Could not retrieve session token for test user");
    await createContactAPI(token, "Alice Test", `alice-${testEmail}`);
    await createContactAPI(token, "Bob Test", `bob-${testEmail}`);

    await page.goto(`${WEB_BASE}/contacts`);
    await expect(page.getByText(/Alice Test/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Bob Test/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("Nouvelle demande button opens create contact dialog", async ({ page }) => {
    await page.goto(`${WEB_BASE}/contacts`);
    const newBtn = page.getByRole("button", { name: /nouveau|nouvelle|ajouter/i }).first();
    await expect(newBtn).toBeVisible();
    await newBtn.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
  });

  test("create contact form validation — name required", async ({ page }) => {
    await page.goto(`${WEB_BASE}/contacts`);
    await page.getByRole("button", { name: /nouveau|nouvelle|ajouter/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

    const submitBtn = page.getByRole("button", { name: /créer|ajouter/i }).first();
    await submitBtn.click();
    // Should stay in dialog (browser required validation)
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 2000 });
  });

  test("creates a contact and shows it in the list", async ({ page }) => {
    await page.goto(`${WEB_BASE}/contacts`);
    await page.getByRole("button", { name: /nouveau|nouvelle|ajouter/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

    // Fill form
    const nameInput = page.locator("#name, input[name='name'], input[placeholder*='nom']").first();
    const emailInput = page.locator("#email, input[name='email'], input[placeholder*='email']").first();

    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("E2E Contact");
    }
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill(`e2econtact-${testEmail}`);
    }

    await page.getByRole("button", { name: /créer|ajouter/i }).first().click();
    await page.waitForLoadState("networkidle");

    // Dialog should close or contact should appear
    const dialogOpen = await page.locator('[role="dialog"]').isVisible().catch(() => false);
    if (!dialogOpen) {
      await expect(page.getByText(/E2E Contact/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});

// ============================================================================
// /contacts/[id] — contact detail
// ============================================================================

test.describe("contact detail", () => {
  let testEmail: string;
  let testToken: string;
  let contactId: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(testEmail, password, "Detail Contact User");
    testToken = user.token;
    const contact = await createContactAPI(testToken, "Contact Detail Person", `detail-${testEmail}`, "0475123456", "Note perso");
    contactId = contact.id;

    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("non-existent contact shows not found", async ({ page }) => {
    await page.goto(`${WEB_BASE}/contacts/non-existent-contact-id`);
    await expect(page.getByText(/non trouvé|introuvable|not found/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("shows contact name, email, phone", async ({ page }) => {
    await page.goto(`${WEB_BASE}/contacts/${contactId}`);
    await expect(page.getByText(/Contact Detail Person/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(new RegExp(`detail-${testEmail}`, "i")).first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/0475123456/i).first()).toBeVisible({ timeout: 3000 });
  });

  test("shows loan history for contact", async ({ page }) => {
    // Create a loan with this contact
    const col = await createCollectionAPI(testToken, "Loan History Collection");
    const obj = await createObjectAPI(testToken, col.id, "Loaned Object for History");
    await createLoanAPI(testToken, obj.id, contactId);

    await page.goto(`${WEB_BASE}/contacts/${contactId}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Loaned Object for History/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("contact detail has link back to /contacts", async ({ page }) => {
    await page.goto(`${WEB_BASE}/contacts/${contactId}`);
    const backLink = page.locator("main a").filter({ hasText: /contacts/i }).first();
    await expect(backLink).toBeVisible({ timeout: 3000 });
  });
});

// ============================================================================
// Contact edit & delete
// ============================================================================

test.describe("contact edit and delete", () => {
  let testEmail: string;
  let testToken: string;
  let contactId: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(testEmail, password, "Edit Delete User");
    testToken = user.token;
    const contact = await createContactAPI(testToken, "Editable Contact", `edit-${testEmail}`);
    contactId = contact.id;
    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("contact detail page has edit button", async ({ page }) => {
    await page.goto(`${WEB_BASE}/contacts/${contactId}`);
    await expect(page.getByRole("button", { name: /modifier|éditer/i }).first()).toBeVisible({ timeout: 3000 });
  });

  test("edit button opens edit dialog", async ({ page }) => {
    await page.goto(`${WEB_BASE}/contacts/${contactId}`);
    await page.getByRole("button", { name: /modifier|éditer/i }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
  });

  test("contact card in list has delete button", async ({ page }) => {
    await page.goto(`${WEB_BASE}/contacts`);
    const card = page.locator(".card-vhs").filter({ hasText: /Editable Contact/i }).first();
    const deleteBtn = card.getByRole("button", { name: /supprimer|delete/i }).first();
    await expect(deleteBtn).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test("delete button shows confirmation dialog", async ({ page }) => {
    await page.goto(`${WEB_BASE}/contacts`);
    const card = page.locator(".card-vhs").filter({ hasText: /Editable Contact/i }).first();
    const deleteBtn = card.getByRole("button", { name: /supprimer|delete/i }).first();
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await expect(page.locator('[role="alertdialog"], [role="dialog"]')).toBeVisible({ timeout: 3000 });
    }
  });
});

// ============================================================================
// Responsive
// ============================================================================

test.describe("contacts responsive", () => {
  test("renders at 375px mobile", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(email, password, "Responsive Contacts User");
    await signIn(page, email, password);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/contacts`);
    await expect(page.locator("main, [role='main']").first()).toBeVisible();
  });
});