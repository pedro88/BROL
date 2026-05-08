/**
 * Auth helper for E2E tests.
 * Uses API-based setup for reliability, then injects session into browser.
 *
 * @package @brol/web
 */

import { Page } from "@playwright/test";

const API_BASE = process.env.PLAYWRIGHT_API_BASE ?? "http://localhost:3001";
const WEB_BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

// ============================================================================
// API helpers
// ============================================================================

/**
 * Creates a user via API and returns the session token directly.
 * Does NOT set cookies in browser — use `setSessionCookie()` for that.
 */
export async function createUserAPI(
  email: string,
  password: string,
  name?: string,
): Promise<{ token: string; user: { id: string; email: string; name: string | null } }> {
  const res = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: WEB_BASE,
    },
    body: JSON.stringify({ email, password, name: name ?? email.split("@")[0] }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`createUserAPI failed: ${res.status} ${body.message ?? res.statusText}`);
  }
  const data = await res.json();
  return { token: data.token, user: data.user };
}

/**
 * Gets the most recent session token for a user email from DB.
 */
export async function getSessionToken(email: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/test/get-token?email=${encodeURIComponent(email)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Cleans up a user account and all associated data (best effort).
 */
export async function cleanupUser(email: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/test/cleanup-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    // Non-critical
  }
}

/**
 * Generates a unique test email.
 */
export function uniqueEmail(): string {
  return `playwright-${Date.now()}-${Math.random().toString(36).slice(2)}@test.brol`;
}

// ============================================================================
// Session injection (sets browser cookie directly from API session token)
// ============================================================================

/**
 * Sets the session cookie in the browser from a token string and syncs
 * the token to the global store (read by tRPC headers).
 *
 * BetterAuth stores the session token as a cookie named "better-auth.session_token"
 * with value "<sessionId>.<signature>" (Url-safe Base64 encoded, URL-encoded).
 * The raw token returned by sign-up is the sessionId — we need to call get-session
 * to get the full token with signature, then set it as a cookie.
 *
 * The session cookie also enables the middleware to recognize the session.
 * Without the signature in the cookie, get-session returns null.
 */
export async function injectSessionFromToken(page: Page, token: string): Promise<void> {
  // Get the full token with signature from get-session endpoint
  const result = await page.evaluate(async (baseUrl, sessionId) => {
    try {
      const res = await fetch(`${baseUrl}/api/auth/get-session`, {
        method: "GET",
        headers: { Authorization: `Bearer ${sessionId}` },
      });
      const data = await res.json();
      return { ok: res.ok, fullToken: data?.session?.token ?? null };
    } catch {
      return { ok: false, fullToken: null };
    }
  }, WEB_BASE, token);

  if (!result.ok || !result.fullToken) {
    throw new Error(
      `injectSessionFromToken: get-session failed (ok=${result.ok}, fullToken=${result.fullToken})`
    );
  }

  // The fullToken from get-session is URL-encoded (contains %2F, %3D, etc.)
  // We must use it as-is (do NOT decode it) because browsers store the encoded value
  // and also the URL-encoded format is needed for proper cookie matching.
  await page.context().addCookies([
    {
      name: "better-auth.session_token",
      value: result.fullToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  // Navigate to app root to trigger AuthSessionSyncer which reads the cookie
  // and syncs the token to the global store (tRPC uses this for Bearer auth)
  await page.goto(`${WEB_BASE}/`, { waitUntil: "networkidle" });
}

/**
 * Signs in via UI form and waits for navigation.
 * Throws if sign-in fails (navigation times out).
 */
export async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto(`${WEB_BASE}/sign-in`);

  // Ensure sign-in mode
  const heading = page.getByRole("heading", { name: /connexion/i });
  const headingVisible = await heading.isVisible().catch(() => false);
  if (!headingVisible) {
    const toggleBtn = page.getByText(/déjà un compte/i);
    if (await toggleBtn.isVisible().catch(() => false)) {
      await toggleBtn.click();
      await heading.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
    }
  }

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mot de passe/i).fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();

  // Wait for navigation away from sign-in (BetterAuth redirect)
  try {
    await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
      timeout: 10000,
    });
    // Give AuthSessionSyncer time to sync the token to the store (100ms)
    await page.waitForTimeout(500);
  } catch {
    const errorText = await page.locator(".text-destructive, [role=alert]").first().textContent().catch(() => "(no error message)");
    throw new Error(`signIn failed: still on /sign-in after submission. Error: ${errorText}`);
  }
}

/**
 * Signs up via UI form and waits for navigation.
 * Throws if sign-up fails (navigation times out).
 */
export async function signUp(
  page: Page,
  email: string,
  password: string,
  name?: string,
): Promise<void> {
  await page.goto(`${WEB_BASE}/sign-in`);

  const toggleBtn = page.getByText(/pas encore de compte/i);
  await toggleBtn.click();
  await page.getByRole("heading", { name: /créer un compte/i }).waitFor({
    state: "visible",
    timeout: 3000,
  });

  await page.getByLabel(/nom/i).fill(name ?? email.split("@")[0]);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mot de passe/i).fill(password);
  await page.getByRole("button", { name: /créer mon compte/i }).click();

  try {
    await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
      timeout: 10000,
    });
  } catch {
    // Grab the error message so test failure is informative
    const errorText = await page.locator(".text-destructive, [role=alert]").first().textContent().catch(() => "(no error message)");
    throw new Error(`signUp failed: still on /sign-in after submission. Error: ${errorText}`);
  }
}

/**
 * Clears the current session by calling the sign-out endpoint from the browser.
 * This works regardless of whether a sign-out button exists in the UI.
 */
export async function clearSession(page: Page): Promise<void> {
  try {
    const result = await page.evaluate(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/sign-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: "{}",
      });
      return { ok: response.ok, status: response.status };
    }, WEB_BASE);
    if (!result.ok) {
      console.warn(`clearSession: sign-out returned ${result.status}`);
    }
  } catch (err) {
    // Sign-out endpoint may fail if session already expired — that's OK
    console.warn(`clearSession: fetch failed (${String(err)}), session may already be cleared`);
  }
}

/**
 * Clicks sign-out button and waits for redirect.
 */
export async function signOut(page: Page): Promise<void> {
  const signOutBtn = page
    .getByText(/se déconnecter/i)
    .or(page.getByRole("button", { name: /se déconnecter/i }));
  await signOutBtn.click().catch(() => {});
  await page.waitForURL(/\/sign-in/, { timeout: 5000 }).catch(() => {});
}

/**
 * Returns true if not on /sign-in (indicating an active session).
 */
export async function hasActiveSession(page: Page): Promise<boolean> {
  return !page.url().includes("/sign-in");
}
