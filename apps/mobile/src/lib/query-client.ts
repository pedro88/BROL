/**
 * QueryClient singleton for React Native.
 * @package @brol/mobile
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Singleton QueryClient for the entire app.
 * Configured with sensible defaults for mobile usage.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000, // 5 seconds
      retry: 1, // retry failed queries once
      gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
    },
    mutations: {
      retry: 0, // don't retry mutations
    },
  },
});

export default queryClient;