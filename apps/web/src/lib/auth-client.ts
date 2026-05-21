/**
 * BetterAuth client for the Next.js web app.
 * Handles email/password and sign-out calls.
 *
 * OAuth sign-in/out functions are commented out for future use.
 *
 * @package @brol/web
 */

/**
 * URL de base de l'API Better-auth.
 * En prod : `https://api.brol.dev` (via NEXT_PUBLIC_API_URL inliné au build).
 * En dev local : fallback `http://localhost:3001`.
 *
 * IMPORTANT : on utilise NEXT_PUBLIC_API_URL (l'API tRPC), pas NEXT_PUBLIC_APP_URL
 * (le frontend Next), car Better-auth est hébergé côté API.
 */
function getBaseUrl(): string {
  // process.env.NEXT_PUBLIC_* est inliné par Next au build → fonctionne côté client ET serveur
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
}

const baseUrl = getBaseUrl();

// ============================================================================
// Email / Password
// ============================================================================

export interface SignInResult {
  session?: unknown;
  user?: unknown;
  error?: string;
}

export interface SignUpResult {
  session?: unknown;
  user?: unknown;
  error?: string;
}

/**
 * Signs in a user with email and password.
 * Note: BetterAuth's sign-in API is async and the client SDK
 * returns a Promise resolving after the redirect completes.
 * Since we're on a SPA page, we handle navigation client-side.
 */
export async function signInEmailPassword(
  email: string,
  password: string,
): Promise<SignInResult> {
  try {
    // Don't pass callbackURL to the fetch — BetterAuth's API endpoint
    // will return a redirect response when callbackURL is provided,
    // which breaks our client-side SPA flow. Instead, establish the
    // session cookie first, then navigate manually.
    const res = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message ?? "Sign-in failed" };
    }

    return { session: data.session, user: data.user };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Signs up a new user with email and password.
 */
export async function signUpEmailPassword(
  email: string,
  password: string,
  name: string,
): Promise<SignUpResult> {
  try {
    // Same reasoning as signInEmailPassword: don't pass callbackURL
    // to avoid redirect response from BetterAuth API.
    const res = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message ?? "Sign-up failed" };
    }

    return { session: data.session, user: data.user };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}

/**
 * Signs out the current session and clears the session cookie.
 */
export async function signOut(): Promise<void> {
  await fetch(`${baseUrl}/api/auth/sign-out`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
}

/**
 * Fetches the current session from BetterAuth.
 * Returns the session object or null if not authenticated.
 */
export async function getSession(): Promise<unknown> {
  try {
    const res = await fetch(`${baseUrl}/api/auth/get-session`, {
      credentials: "include",
    });
    return res.json();
  } catch {
    return null;
  }
}
