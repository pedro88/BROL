/**
 * Global store for the BetterAuth session token.
 * Used by the tRPC client to pass the session token as a Bearer header
 * to the API server.
 *
 * @package @brol/web
 */

import { atom } from "nanostores";

/**
 * Session token atom — stores the raw session token from BetterAuth.
 * Updated by the auth client when sign-in/sign-out occurs.
 * Read by the tRPC headers link to attach the token to API requests.
 */
export const sessionTokenStore = atom<string | undefined>(undefined);

/**
 * Set the session token (called on sign-in).
 */
export function setSessionToken(token: string | undefined) {
  sessionTokenStore.set(token);
}

/**
 * Get the current session token synchronously.
 */
export function getSessionToken(): string | undefined {
  return sessionTokenStore.get();
}

/**
 * Clear the session token from the global store.
 * Call this when signing out or clearing session to ensure
 * the tRPC client stops sending a stale Bearer token.
 */
export function clearSessionToken(): void {
  sessionTokenStore.set(undefined);
}
