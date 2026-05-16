/**
 * tRPC client configuration for React Native.
 * Single source of truth — import from here in all components.
 * @package @brol/mobile
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@brol/api";

/**
 * Client tRPC React pour une utilisation avec React Query.
 * Used by the provider to create the client and by all components (hooks).
 *
 * Note: We use a plain fetch HTTP link (not httpBatchLink) for better
 * React Native compatibility. This is slightly less efficient for
 * batching but works more reliably on mobile networks.
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Default API URL.
 * In development: http://localhost:3001
 * In production: set via environment variable EXPO_PUBLIC_API_URL
 */
export const DEFAULT_API_URL = "http://localhost:3001";

/**
 * Get the API URL from environment or fallback to default.
 * Uses EXPO_PUBLIC_API_URL (expo-constants) or constant.
 */
export function getApiUrl(): string {
  // Try environment variable (set via expo build or .env)
  // In Expo, env vars are prefixed with EXPO_PUBLIC_
  const envUrl =
    typeof process !== "undefined"
      ? process.env.EXPO_PUBLIC_API_URL
      : undefined;

  return envUrl ?? DEFAULT_API_URL;
}