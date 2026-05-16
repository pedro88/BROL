/**
 * Secure storage wrapper using expo-secure-store.
 * Stores sensitive data (session token) in the device keychain/keystore.
 * @package @brol/mobile
 */

import * as SecureStore from "expo-secure-store";

/**
 * Storage keys used by the app.
 */
const STORAGE_KEYS = {
  SESSION_TOKEN: "sessionToken",
} as const;

/**
 * Store a string value in secure storage.
 */
export async function setItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value, {
      requireBPOSDeviceEncryption: false,
    });
  } catch (err) {
    console.error(`[secure-storage] setItem("${key}") failed:`, err);
    throw err;
  }
}

/**
 * Get a string value from secure storage.
 * Returns null if not found or on error.
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (err) {
    console.error(`[secure-storage] getItem("${key}") failed:`, err);
    return null;
  }
}

/**
 * Delete a value from secure storage.
 */
export async function deleteItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    console.error(`[secure-storage] deleteItem("${key}") failed:`, err);
  }
}

// Convenience wrappers for session token
export async function setSessionToken(token: string): Promise<void> {
  return setItem(STORAGE_KEYS.SESSION_TOKEN, token);
}

export async function getSessionToken(): Promise<string | null> {
  return getItem(STORAGE_KEYS.SESSION_TOKEN);
}

export async function deleteSessionToken(): Promise<void> {
  return deleteItem(STORAGE_KEYS.SESSION_TOKEN);
}

export { STORAGE_KEYS };