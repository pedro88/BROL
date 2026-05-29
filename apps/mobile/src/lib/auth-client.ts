/**
 * BetterAuth client for React Native mobile app.
 * Handles email/password sign-in, sign-up, sign-out, and session fetch.
 *
 * Note: No cookies on mobile — we use Authorization Bearer tokens.
 * Token is stored in expo-secure-store and sent on every request.
 *
 * @package @brol/mobile
 */

import Constants from "expo-constants";
import type { AuthUser, AuthSession } from "@brol/shared";

export type { AuthUser, AuthSession };

/**
 * Get API base URL from environment.
 * Uses EXPO_PUBLIC_API_URL env var or falls back to localhost:3001.
 */
function getBaseUrl(): string {
  // In Expo, env vars are prefixed with EXPO_PUBLIC_
  const envUrl =
    typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>).EXPO_PUBLIC_API_URL
      : undefined;

  return (
    envUrl ??
    Constants.expoConfig?.extra?.apiUrl ??
    Constants.manifest?.extra?.apiUrl ??
    "http://localhost:3001"
  );
}

const baseUrl = getBaseUrl();

// ============================================================================
// Types
// ============================================================================

export interface SignInResult {
  session?: AuthSession;
  user?: AuthUser;
  sessionToken?: string;
  error?: string;
}

export interface SignUpResult {
  session?: AuthSession;
  user?: AuthUser;
  sessionToken?: string;
  error?: string;
}

// ============================================================================
// Sign In — Email + Password
// ============================================================================

/**
 * Signs in a user with email and password.
 * Returns { session, user, sessionToken } on success.
 * The sessionToken is the raw BetterAuth token to store.
 */
export async function signInEmailPassword(
  email: string,
  password: string,
): Promise<SignInResult> {
  try {
    const res = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message ?? "Sign-in failed" };
    }

    // BetterAuth returns { session, user } on success
    // The session.token is the raw sessionToken we need to store
    return {
      session: data.session as AuthSession,
      user: data.user as AuthUser,
      sessionToken: (data.session as AuthSession)?.session?.token,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}

// ============================================================================
// Sign Up — Email + Password
// ============================================================================

/**
 * Signs up a new user with email, password, and name.
 */
export async function signUpEmailPassword(
  email: string,
  password: string,
  name: string,
): Promise<SignUpResult> {
  try {
    const res = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message ?? "Sign-up failed" };
    }

    return {
      session: data.session as AuthSession,
      user: data.user as AuthUser,
      sessionToken: (data.session as AuthSession)?.session?.token,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}

// ============================================================================
// Sign Out
// ============================================================================

/**
 * Signs out the current session.
 */
export async function signOut(): Promise<void> {
  try {
    await fetch(`${baseUrl}/api/auth/sign-out`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Ignore network errors on sign-out
  }
}

// ============================================================================
// Get Session — restore from stored token
// ============================================================================

/**
 * Fetches the current session from BetterAuth using Bearer token.
 * The token is the raw sessionToken stored in secure storage.
 *
 * Note: BetterAuth's /api/auth/get-session also works with
 * Authorization: Bearer {token} header (not just cookies).
 * This is how we restore session on mobile without cookies.
 */
export async function getSession(token: string): Promise<{
  session: AuthSession | null;
  user: AuthUser | null;
}> {
  try {
    const res = await fetch(`${baseUrl}/api/auth/get-session`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return { session: null, user: null };
    }

    const data = await res.json();

    // BetterAuth returns { session, user } or empty object
    if (data.session && data.user) {
      return {
        session: data.session as AuthSession,
        user: data.user as AuthUser,
      };
    }

    return { session: null, user: null };
  } catch {
    return { session: null, user: null };
  }
}