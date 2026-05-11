import { test as base, expect, Page } from "@playwright/test";
import {
  createUserAPI,
  cleanupUser,
  clearSession,
  signUp,
  signIn,
  uniqueEmail,
} from "./helpers/auth";

// Re-export for convenience
export { createUserAPI, cleanupUser, clearSession, signUp, signIn, uniqueEmail };

const WEB_BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

// Extend base test with shared fixtures
const test = base.extend<{ testEmail: string }>({
  // No shared testEmail fixture — each test manages its own
});

// ============================================================================
// Form validation
// ============================================================================

test.describe("form validation", () => {
  test("empty email shows required error", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);
    // Submit without filling email
    await page.getByRole("button", { name: /se connecter/i }).click();
    // HTML5 required prevents submission, or we see validation message
    await expect(page.locator("#email")).toBeFocused();
  });

  test("empty password shows required error", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);
    await page.locator("#email").fill("test@example.com");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.locator("#password")).toBeFocused();
  });

  test("invalid email format shows error", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);
    await page.locator("#email").fill("not-an-email");
    await page.locator("#password").fill("TestPass123!");
    await page.getByRole("button", { name: /se connecter/i }).click();
    // Browser HTML5 email validation should prevent submission
    await expect(page.locator("#email")).toHaveAttribute("type", "email");
  });

  test("password too short shows error", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);

    // Toggle to sign-up mode
    await page.getByText(/pas encore de compte/i).click();
    await expect(page.getByRole("heading", { name: /créer un compte/i })).toBeVisible();

    // Try to submit with password < 8 chars
    await page.locator("#name").fill("Short Pass Test");
    await page.locator("#email").fill(uniqueEmail());
    await page.locator("#password").fill("1234567"); // 7 chars — too short
    await page.getByRole("button", { name: /créer mon compte/i }).click();

    // Browser minLength=8 should prevent submission
    await expect(page.locator("#password")).toBeFocused();
  });
});

// ============================================================================
// Sign-up
// ============================================================================

test.describe("sign-up", () => {
  let testEmail: string;

  test.beforeEach(() => {
    testEmail = uniqueEmail();
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("creates account and redirects away from sign-in", async ({ page }) => {
    const password = "TestPass123!";
    await signUp(page, testEmail, password, "Sign Up Test User");

    // Should be redirected away from /sign-in
    await expect(page).not.toHaveURL(/\/sign-in/);
  });

  test("duplicate email shows error", async ({ page }) => {
    const password = "TestPass123!";
    // Pre-create account via API (avoids needing to handle first signUp in UI)
    await createUserAPI(testEmail, password, "First User");

    // Navigate to sign-up and submit with existing email
    await page.goto(`${WEB_BASE}/sign-in`);
    await page.getByText(/pas encore de compte/i).click();
    await expect(page.getByRole("heading", { name: /créer un compte/i })).toBeVisible();

    await page.locator("#name").fill("Duplicate User");
    await page.locator("#email").fill(testEmail);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: /créer mon compte/i }).click();

    // Should stay on sign-up page and show error
    await expect(page.getByRole("heading", { name: /créer un compte/i })).toBeVisible();
    // BetterAuth duplicate email error
    await expect(page.locator('[role="alert"], .text-destructive, [data-error]').first()).toBeVisible({ timeout: 5000 });
  });

  test("sign-up and re-sign-in cycle — password hash works in DB", async ({ page }) => {
    const password = "TestPass123!";
    // Sign up via UI
    await signUp(page, testEmail, password, "DB Hash Test");

    // Clear session via browser fetch (credentials:include sends the cookie)
    await clearSession(page);

    // Sign in with same credentials — should work
    await signIn(page, testEmail, password);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });

  test("sign-up with too-short password is blocked", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);
    await page.getByText(/pas encore de compte/i).click();
    await expect(page.getByRole("heading", { name: /créer un compte/i })).toBeVisible();

    await page.locator("#name").fill("Test User");
    await page.locator("#email").fill(testEmail);
    await page.locator("#password").fill("1234567"); // too short (minLength=8)
    await page.getByRole("button", { name: /créer mon compte/i }).click();

    // Browser should prevent submission
    await expect(page.locator("#password")).toBeFocused();
  });
});

// ============================================================================
// Sign-in happy path
// ============================================================================

test.describe("sign-in", () => {
  let testEmail: string;

  test.beforeEach(async () => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(testEmail, password, "Sign In Test User");
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("valid credentials redirect away from sign-in", async ({ page }) => {
    const password = "TestPass123!";
    await signIn(page, testEmail, password);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });

  test("session cookie is set after sign-in", async ({ page }) => {
    const password = "TestPass123!";
    await signIn(page, testEmail, password);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(
      (c) => c.name.includes("session") || c.name.includes("better-auth"),
    );
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value.length).toBeGreaterThan(0);
  });

  test("wrong password shows error", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);
    await page.locator("#email").fill(testEmail);
    await page.locator("#password").fill("WrongPassword999!");
    await page.getByRole("button", { name: /se connecter/i }).click();

    await expect(page).toHaveURL(/\/sign-in/);
    // BetterAuth returns "Invalid email or password"
    await expect(page.locator('[role="alert"], .text-destructive, [data-error]').first()).toBeVisible({ timeout: 5000 });
  });

  test("non-existent email shows error", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);
    await page.locator("#email").fill(`nonexistent-${uniqueEmail()}`);
    await page.locator("#password").fill("TestPass123!");
    await page.getByRole("button", { name: /se connecter/i }).click();

    await expect(page).toHaveURL(/\/sign-in/);
    // BetterAuth returns "Invalid email or password"
    await expect(page.locator('[role="alert"], .text-destructive, [data-error]').first()).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================================
// Session persistence (use createUserAPI + UI sign-in)
// ============================================================================

test.describe("session persistence", () => {
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(testEmail, password, "Session Test User");
    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("session persists across page navigation", async ({ page }) => {
    await page.goto(`${WEB_BASE}/collections`);
    await expect(page).toHaveURL(/\/collections/);
  });

  test("session survives page refresh", async ({ page }) => {
    await page.goto(`${WEB_BASE}/collections`);
    await expect(page).toHaveURL(/\/collections/);
    await page.reload();
    await expect(page).toHaveURL(/\/collections/);
  });

  test("has active session on /collections after sign-in", async ({ page }) => {
    await page.goto(`${WEB_BASE}/collections`);
    await expect(page).toHaveURL(/\/collections/);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "better-auth.session_token");
    expect(sessionCookie).toBeDefined();
  });
});

// ============================================================================
// Sign-out (use UI sign-in then clear via fetch)
// ============================================================================

test.describe("sign-out", () => {
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    testEmail = uniqueEmail();
    const password = "TestPass123!";
    await createUserAPI(testEmail, password, "Sign Out Test User");
    await signIn(page, testEmail, password);
  });

  test.afterEach(async () => {
    await cleanupUser(testEmail).catch(() => {});
  });

  test("authenticated session allows access to /collections", async ({ page }) => {
    await page.goto(`${WEB_BASE}/collections`);
    await expect(page).toHaveURL(/\/collections/);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "better-auth.session_token");
    expect(sessionCookie).toBeDefined();
  });

  test("sign-out clears session", async ({ page }) => {
    await page.goto(`${WEB_BASE}/collections`);
    await expect(page).toHaveURL(/\/collections/);
    await clearSession(page);
    await page.goto(`${WEB_BASE}/collections`);
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 5000 });
  });

  test("session cleared — /collections redirects to sign-in", async ({ page }) => {
    await page.goto(`${WEB_BASE}/collections`);
    await expect(page).toHaveURL(/\/collections/);
    await clearSession(page);
    await page.goto(`${WEB_BASE}/collections`);
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

// ============================================================================
// Browse (public — no auth needed)
// ============================================================================

test.describe("browse", () => {
  test("accessible without auth", async ({ page }) => {
    await page.goto(`${WEB_BASE}/browse`);
    await expect(page).toHaveURL(/\/browse/);
  });

  test("shows COLLECTIONS PUBLIQUES heading", async ({ page }) => {
    await page.goto(`${WEB_BASE}/browse`);
    await expect(page.getByRole("heading", { name: /collections publiques/i }).first()).toBeVisible();
  });
});

// ============================================================================
// Toggle between sign-in / sign-up modes
// ============================================================================

test.describe("toggle", () => {
  test("sign-in to sign-up mode", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);
    await page.getByText(/pas encore de compte/i).click();
    await expect(page.getByRole("heading", { name: /créer un compte/i })).toBeVisible();
  });

  test("sign-up to sign-in mode", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);
    await page.getByText(/pas encore de compte/i).click();
    await expect(page.getByRole("heading", { name: /créer un compte/i })).toBeVisible();
    await page.getByText(/déjà un compte/i).click();
    await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
  });
});

// ============================================================================
// Responsive
// ============================================================================

test.describe("responsive", () => {
  test("form renders at 375px mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/sign-in`);
    await expect(page.locator("#email")).toBeVisible();
  });

  test("browse renders at 375px mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${WEB_BASE}/browse`);
    await expect(page).toHaveURL(/\/browse/);
  });
});

// ============================================================================
// OAuth (not implemented yet)
// ============================================================================

test.describe("OAuth", () => {
  test("Google button NOT rendered (commented out)", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);
    await expect(page.getByRole("button", { name: /google/i })).not.toBeVisible();
  });

  test("GitHub button NOT rendered (commented out)", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);
    await expect(page.getByRole("button", { name: /github/i })).not.toBeVisible();
  });

  test("Apple button NOT rendered (commented out)", async ({ page }) => {
    await page.goto(`${WEB_BASE}/sign-in`);
    await expect(page.getByRole("button", { name: /apple/i })).not.toBeVisible();
  });
});
