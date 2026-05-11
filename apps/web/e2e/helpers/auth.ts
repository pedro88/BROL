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
 * Injects session and waits for token sync to complete.
 * Returns the page with an authenticated session.
 */
export async function injectSessionFromToken(page: Page, token: string): Promise<void> {
  // Get the full token with signature from get-session endpoint
  const result = await page.evaluate(async ({ baseUrl, sessionId }) => {
    try {
      const res = await fetch(`${baseUrl}/api/auth/get-session`, {
        method: "GET",
        headers: { Authorization: `Bearer ${sessionId}` },
      });
      const data = await res.json();
      // Fallback: if get-session returns the raw token (BetterAuth format), use it directly
      const fullToken = data?.session?.token ?? data?.token ?? null;
      return { ok: res.ok, fullToken, data };
    } catch (err) {
      return { ok: false, fullToken: null, error: String(err) };
    }
  }, { baseUrl: WEB_BASE, sessionId: token });

  // If get-session failed, try using the raw token directly (it might work)
  const finalToken = result.fullToken ?? token;

  // The token from BetterAuth is URL-encoded — use as-is
  await page.context().addCookies([
    {
      name: "better-auth.session_token",
      value: finalToken,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  // Navigate to app root to trigger AuthSessionSyncer
  await page.goto(`${WEB_BASE}/`, { waitUntil: "networkidle" });

  // Wait for AuthSessionSyncer to sync token to the store.
  // The component reads the cookie and calls /api/auth/get-session,
  // then sets the token in the global store. This takes a moment.
  // We verify the store is populated before returning so tRPC calls work.
  await page.waitForTimeout(1500);

  // Verify the token is now in the auth store
  const storeHasToken = await page.evaluate(() => {
    // Read from the global window (nanostores atoms are accessible here)
    const token = (window as Record<string, unknown>)["sessionTokenStore"];
    return token != null && token !== "";
  });

  // If the store doesn't have the token, session syncing failed
  // The tRPC header link will have no auth — mutations will 401
  if (!storeHasToken) {
    console.warn(
      "injectSessionFromToken: session store empty after sync — tRPC calls may 401. " +
      "Ensure AuthSessionSyncer is mounted in Providers."
    );
  }
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

  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();

  // Wait for navigation away from sign-in (BetterAuth redirect)
  try {
    await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
      timeout: 10000,
    });
    // Give AuthSessionSyncer time to sync the token to the store
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

  await page.locator("#name").fill(name ?? email.split("@")[0]);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator("#passwordConfirm").fill(password);
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
 * Clears the current session by calling the sign-out endpoint from the browser
 * AND wiping all cookies.  This works regardless of whether a sign-out button
 * exists in the UI.
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
  // Wipe all cookies so the session is gone even if the API call succeeded
  // but did not delete the cookie (BetterAuth quirk).
  await page.context().clearCookies();
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

