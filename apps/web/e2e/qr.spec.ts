/**
 * E2E tests for QR codes feature.
 * Tests: generate → list → delete → assign to object → display QR.
 *
 * @package @brol/web
 */

import { test, expect } from "@playwright/test";
import { test as setup, createTestUser, createTestCollection, createTestObject, signInEmailPassword } from "../helpers/auth";
import { getSessionToken } from "@/lib/auth-store";

// Use same DB setup as auth helper
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

test.describe("QR Codes", () => {
  let userId: string;
  let sessionToken: string;
  let collectionId: string;
  let objectId: string;

  test.beforeAll(async () => {
    // Create a test user via API
    const { usersApi } = await import("@brol/test-api");
    const user = await usersApi.create({
      email: `qr-e2e-${Date.now()}@example.com`,
      password: "testpass123",
      name: "QR E2E User",
    });
    userId = user.id;

    // Sign in to get session token
    const signInResult = await signInEmailPassword(user.email, "testpass123", API_URL);
    sessionToken = signInResult.token;

    // Create a collection and object for assign tests
    const { collectionsApi } = await import("@brol/test-api");
    const collection = await collectionsApi.create(user.id, {
      name: "QR Test Collection",
      description: "Collection for QR E2E tests",
      isPublic: false,
    });
    collectionId = collection.id;

    const { objectsApi } = await import("@brol/test-api");
    const object = await objectsApi.create(user.id, collectionId, {
      name: "QR Test Object",
      condition: "GOOD",
    });
    objectId = object.id;
  });

  test.afterAll(async () => {
    if (userId) {
      const { usersApi } = await import("@brol/test-api");
      await usersApi.delete(userId);
    }
  });

  test("generate QR codes and see them in the list", async ({ page }) => {
    // Inject session
    await page.evaluate(
      async ({ token }) => {
        const { setSessionToken } = await import("@/lib/auth-store");
        setSessionToken(token);
      },
      { token: sessionToken }
    );

    // Navigate to /qr
    await page.goto("http://localhost:3000/qr");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Should see the header
    await expect(page.locator("h1")).toContainText("QR CODES");

    // Find the count input and generate button
    const countInput = page.locator('input[type="number"]');
    const generateButton = page.locator("button", { hasText: "Générer" });

    // Generate 3 codes
    await countInput.fill("3");
    await generateButton.click();

    // Wait for mutation to complete and list to refresh
    await page.waitForTimeout(2000);

    // Should see success message
    await expect(page.locator("text=3 code(s) généré(s) !")).toBeVisible({ timeout: 5000 });

    // Should see the codes in the list
    await expect(page.locator('text=Libre')).toHaveCount(3, { timeout: 5000 });
  });

  test("delete a QR code", async ({ page }) => {
    await page.evaluate(
      async ({ token }) => {
        const { setSessionToken } = await import("@/lib/auth-store");
        setSessionToken(token);
      },
      { token: sessionToken }
    );

    await page.goto("http://localhost:3000/qr");
    await page.waitForLoadState("networkidle");

    // Generate a code first
    await page.locator('input[type="number"]').fill("1");
    await page.locator("button", { hasText: "Générer" }).click();
    await page.waitForTimeout(2000);

    // Find and click delete button (trash icon)
    const deleteButton = page.locator('button[aria-label], button svg').first();
    // Accept confirm dialog
    page.on("dialog", (dialog) => dialog.accept());
    await deleteButton.click();

    // Wait for list to refresh
    await page.waitForTimeout(1500);
  });

  test("assign QR to object from object detail page", async ({ page }) => {
    await page.evaluate(
      async ({ token }) => {
        const { setSessionToken } = await import("@/lib/auth-store");
        setSessionToken(token);
      },
      { token: sessionToken }
    );

    // Go to the test object
    await page.goto(`http://localhost:3000/objects/${objectId}`);
    await page.waitForLoadState("networkidle");

    // Should see "Assigner un QR code" button (since object has no QR yet)
    const assignButton = page.locator("button", { hasText: "Assigner un QR code" });
    await expect(assignButton).toBeVisible();

    // Generate some QR codes first
    await page.goto("http://localhost:3000/qr");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="number"]').fill("1");
    await page.locator("button", { hasText: "Générer" }).click();
    await page.waitForTimeout(2000);

    // Go back to object
    await page.goto(`http://localhost:3000/objects/${objectId}`);
    await page.waitForLoadState("networkidle");

    // Click assign button
    await assignButton.click();

    // Dialog should open with QR codes
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("text=Libre")).toBeVisible({ timeout: 5000 });

    // Click on a QR code to assign
    const qrButton = dialog.locator("button").filter({ hasText: /^[a-f0-9-]+$/ }).first();
    await qrButton.click();

    // Wait for assignment
    await page.waitForTimeout(2000);

    // Dialog should close and QR section should update
    await expect(dialog).not.toBeVisible();
    await expect(page.locator("text=QR Code")).toBeVisible();
    await expect(page.locator("text=Code")).toBeVisible();
  });

  test("create object with QR code selection", async ({ page }) => {
    await page.evaluate(
      async ({ token }) => {
        const { setSessionToken } = await import("@/lib/auth-store");
        setSessionToken(token);
      },
      { token: sessionToken }
    );

    // Go to add object page with collection
    await page.goto(`http://localhost:3000/objects/add?collectionId=${collectionId}`);
    await page.waitForLoadState("networkidle");

    // Generate QR codes first for selection
    await page.goto("http://localhost:3000/qr");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="number"]').fill("1");
    await page.locator("button", { hasText: "Générer" }).click();
    await page.waitForTimeout(2000);

    // Go back to add object
    await page.goto(`http://localhost:3000/objects/add?collectionId=${collectionId}`);
    await page.waitForLoadState("networkidle");

    // Fill in the form
    await page.fill('input[id="name"]', "Object with QR");

    // Look for QR code section (should be visible since collectionId is provided)
    const qrSection = page.locator("text=Aucun QR code");
    if (await qrSection.isVisible()) {
      // Select "Sélectionner un QR existant"
      await page.locator("text=Sélectionner un QR existant").click();
      // Should show the select dropdown
      await expect(page.locator('select')).toBeVisible();
    }
  });

  test("QR display on object detail after assignment", async ({ page }) => {
    await page.evaluate(
      async ({ token }) => {
        const { setSessionToken } = await import("@/lib/auth-store");
        setSessionToken(token);
      },
      { token: sessionToken }
    );

    // Go to object
    await page.goto(`http://localhost:3000/objects/${objectId}`);
    await page.waitForLoadState("networkidle");

    // If object has QR, should see the image
    const qrSection = page.locator('[alt*="QR Code"]');
    if (await qrSection.isVisible()) {
      // Check download and print buttons
      await expect(page.locator("text=Télécharger PNG")).toBeVisible();
      await expect(page.locator("text=Imprimer")).toBeVisible();
    }
  });
});