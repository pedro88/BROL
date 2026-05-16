/**
 * useAuth hook — reads auth state from the auth atom.
 * @package @brol/mobile
 */

import { useStore } from "@nanostores/react";
import { authAtom, type AuthState } from "./auth-store";

/**
 * Hook to read the current auth state.
 * Re-renders when auth state changes (sign-in, sign-out, session restore).
 *
 * Usage:
 *   const { user, sessionToken, isLoading } = useAuth();
 */
export function useAuth(): AuthState {
  return useStore(authAtom);
}

/**
 * Hook to check if the user is authenticated.
 * Convenience wrapper around useAuth().
 */
export function useIsAuthenticated(): boolean {
  const { user, sessionToken } = useStore(authAtom);
  return user !== null && sessionToken !== null;
}