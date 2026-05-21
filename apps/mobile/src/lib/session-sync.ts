/**
 * Session synchronization on app launch.
 * Reads the stored token, validates it with the API, and restores auth state.
 * @package @brol/mobile
 */

import { authAtom, setAuth, clearAuth, setLoading } from "./auth-store";
import { getSessionToken, deleteSessionToken } from "./secure-storage";
import { getSession } from "./auth-client";
import type { AuthUser } from "./auth-client";

/**
 * Synchronizes the auth state on app launch.
 *
 * Flow:
 * 1. Read session token from secure storage
 * 2. If token exists: call /api/auth/get-session to validate and get user
 * 3. If valid: setAuth(token, user) — restores session
 * 4. If invalid/expired: clearAuth() + token deleted
 * 5. If no token: nothing to do (anonymous user)
 *
 * Call this in the root layout at mount.
 */
export async function syncSession(): Promise<void> {
  console.log("[session-sync] Starting session sync...");

  // Set loading state
  setLoading(true);

  try {
    const token = await getSessionToken();

    if (!token) {
      console.log("[session-sync] No token found — anonymous user");
      setLoading(false);
      return;
    }

    console.log("[session-sync] Token found, validating with API...");

    // Validate token with the API
    const { session, user } = await getSession(token);

    if (session && user) {
      console.log("[session-sync] Token valid — restoring session for:", user.email);
      setAuth(token, user as AuthUser);
    } else {
      console.log("[session-sync] Token invalid or expired — clearing session");
      await deleteSessionToken();
      clearAuth();
    }
  } catch (err) {
    console.error("[session-sync] Session sync failed:", err);
    // On network error, keep the token but don't restore session
    // User will need to retry or sign in again
  } finally {
    setLoading(false);
  }
}

export default syncSession;