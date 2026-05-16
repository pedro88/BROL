/**
 * Auth state store using nanostores.
 * Global atom for sessionToken + user data.
 * Used by TRPCProvider to inject Bearer token into tRPC requests.
 * @package @brol/mobile
 */

import { atom } from "nanostores";

/**
 * User type matching BetterAuth user shape.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  // Add more fields as needed
}

/**
 * Auth state shape.
 */
export interface AuthState {
  sessionToken: string | null;
  user: User | null;
  isLoading: boolean;
}

/**
 * Initial auth state (not authenticated, not loading).
 */
const initialAuthState: AuthState = {
  sessionToken: null,
  user: null,
  isLoading: false,
};

/**
 * Main auth atom — stores session token and user info.
 * Updated by: sign-in (S02/S03), session sync (S04), sign-out (S04).
 * Read by: TRPCProvider (to inject Authorization header).
 */
export const authAtom = atom<AuthState>(initialAuthState);

/**
 * Check if user is authenticated (has token).
 */
export function isAuthenticated(): boolean {
  const state = authAtom.get();
  return state.sessionToken !== null && state.user !== null;
}

/**
 * Get current session token.
 */
export function getSessionToken(): string | null {
  return authAtom.get().sessionToken;
}

/**
 * Set session token and user in auth atom.
 * Called after successful sign-in or session restore.
 */
export function setAuth(token: string, user: User): void {
  authAtom.set({
    sessionToken: token,
    user,
    isLoading: false,
  });
}

/**
 * Clear auth state (sign-out).
 */
export function clearAuth(): void {
  authAtom.set({
    sessionToken: null,
    user: null,
    isLoading: false,
  });
}

/**
 * Set loading state during async operations (session sync, etc).
 */
export function setLoading(loading: boolean): void {
  const current = authAtom.get();
  authAtom.set({ ...current, isLoading: loading });
}