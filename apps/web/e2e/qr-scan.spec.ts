/**
 * E2E tests: QR public scan — /qr/[code] page.
 *
 * M010: QR codes with local network URLs
 */

import { test, expect } from "@playwright/test";
import {
  signIn,
  createUserAPI,
  cleanupUser,
  uniqueEmail,
} from "./helpers/auth";

const WEB_BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const API_BASE = process.env.PLAYWRIGHT_API_BASE ?? "http://localhost:3001";

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
    body: JSON.stringify({ name, isPublic: true, type: "BOOK" }),
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
    body: JSON.stringify({ collectionId, name, author: "QR Author", condition: "GOOD" }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`createObjectAPI: ${JSON.stringify(data.error)}`);
  return { id: data.result?.data?.id };
}

async function generateQrStockAPI(
  userToken: string,
  count: number,
): Promise<{ codes: Array<{ id: string; code: string }> }> {
  const res = await fetch(`${API_BASE}/api/trpc/qr.generateStock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ count }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`generateQrStockAPI: ${JSON.stringify(data.error)}`);
  return { codes: data.result?.data?.codes ?? [] };
}

async function assignQrToObjectAPI(
  userToken: string,
  qrId: string,
  objectId: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/trpc/qr.assignToObject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ qrId, objectId }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`assignQrToObjectAPI: ${JSON.stringify(data.error)}`);
}

test.describe("QR public scan page — /qr/[code]", () => {
  test("unknown QR code shows QR INCONNU", async ({ page }) => {
    await page.goto(`${WEB_BASE}/qr/unknown-code-xyz`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/QR INCONNU/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("valid QR shows object name", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "QR Public User");

    const col = await createCollectionAPI(user.token, "QR Public Collection");
    const obj = await createObjectAPI(user.token, col.id, "Scannable Object");
    const qrResult = await generateQrStockAPI(user.token, 1);
    await assignQrToObjectAPI(user.token, qrResult.codes[0].id, obj.id);

    await page.goto(`${WEB_BASE}/qr/${qrResult.codes[0].code}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Scannable Object/i).first()).toBeVisible({ timeout: 5000 });

    await cleanupUser(email).catch(() => {});
  });

  test("QR page is publicly accessible without auth", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "QR Public No Auth User");

    const col = await createCollectionAPI(user.token, "Public QR Collection");
    const obj = await createObjectAPI(user.token, col.id, "Public QR Object");
    const qrResult = await generateQrStockAPI(user.token, 1);
    await assignQrToObjectAPI(user.token, qrResult.codes[0].id, obj.id);

    // No sign-in, go directly
    await page.goto(`${WEB_BASE}/qr/${qrResult.codes[0].code}`);
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.getByText(/Public QR Object/i).first()).toBeVisible({ timeout: 5000 });

    await cleanupUser(email).catch(() => {});
  });

  test("QR code image is displayed", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "QR Image User");

    const col = await createCollectionAPI(user.token, "QR Image Collection");
    const obj = await createObjectAPI(user.token, col.id, "QR Image Object");
    const qrResult = await generateQrStockAPI(user.token, 1);
    await assignQrToObjectAPI(user.token, qrResult.codes[0].id, obj.id);

    await page.goto(`${WEB_BASE}/qr/${qrResult.codes[0].code}`);
    await page.waitForLoadState("networkidle");

    // QR code canvas/image should be present
    const qrCanvas = page.locator("canvas, svg").first();
    await expect(qrCanvas).toBeVisible({ timeout: 5000 });

    await cleanupUser(email).catch(() => {});
  });

  test("shows author/brand when available", async ({ page }) => {
    const email = uniqueEmail();
    const password = "TestPass123!";
    const user = await createUserAPI(email, password, "QR Author User");

    const col = await createCollectionAPI(user.token, "QR Author Collection");
    const obj = await createObjectAPI(user.token, col.id, "Authored Object");
    const qrResult = await generateQrStockAPI(user.token, 1);
    await assignQrToObjectAPI(user.token, qrResult.codes[0].id, obj.id);

    await page.goto(`${WEB_BASE}/qr/${qrResult.codes[0].code}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/QR Author/i).first()).toBeVisible({ timeout: 5000 });

    await cleanupUser(email).catch(() => {});
  });
});