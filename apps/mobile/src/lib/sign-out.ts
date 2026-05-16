/**
 * Sign-out function.
 * Clears session from auth atom, secure storage, and API.
 * @package @brol/mobile
 */

import { router } from "expo-router";
import { clearAuth } from "./auth-store";
import { deleteSessionToken } from "./secure-storage";
import { signOut as apiSignOut } from "./auth-client";

/**
 * Signs out the current user.
 * 1. Calls the API sign-out endpoint
 * 2. Deletes the session token from secure storage
 * 3. Clears the auth atom
 * 4. Redirects to /sign-in
 *
 * Usage:
 *   import { signOut } from './lib/sign-out';
 *   // In a component:
 *   <TouchableOpacity onPress={signOut}>
 */
export async function signOut(): Promise<void> {
  console.log("[sign-out] Signing out...");

  try {
    // Call API sign-out (fire and forget)
    await apiSignOut();
  } catch (err) {
    // Ignore API errors — we still want to clear local state
    console.warn("[sign-out] API sign-out failed:", err);
  }

  try {
    // Delete local token
    await deleteSessionToken();
  } catch (err) {
    console.warn("[sign-out] Failed to delete session token:", err);
  }

  // Clear auth state
  clearAuth();

  console.log("[sign-out] Signed out, redirecting to /sign-in");

  // Redirect to sign-in
  router.replace("/sign-in");
}

export default signOut;