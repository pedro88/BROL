/**
 * TRPC Provider for React Native.
 * Wraps the app with tRPC + React Query.
 * Token is read from auth-atom at runtime.
 * @package @brol/mobile
 */

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc, getApiUrl } from "./trpc";
import { authAtom } from "./auth-store";

/**
 * TRPCProvider wraps the app and configures:
 * - QueryClient (singleton-like via useState)
 * - tRPC client with httpBatchLink
 * - Authorization header injected from auth-atom
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000, // 5 seconds
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  // Re-create trpcClient when token changes
  const [trpcClient] = useState(() => {
    const token = authAtom.get().sessionToken;

    return trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getApiUrl()}/api/trpc`,
          headers() {
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    });
  });

  // Re-create client when auth state changes
  const [clientKey, setClientKey] = useState(0);

  useEffect(() => {
    // Subscribe to auth atom changes
    const unsubscribe = authAtom.subscribe(() => {
      // Force re-creation of the trpc client by changing the key
      setClientKey((k) => k + 1);
    });

    return unsubscribe;
  }, []);

  // Recreate client when sessionToken changes
  useEffect(() => {
    const token = authAtom.get().sessionToken;
    trpcClient.mutationCache.clear();
  }, [trpcClient]);

  return (
    <trpc.Provider
      key={clientKey}
      client={trpcClient}
      queryClient={queryClient}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

export default TRPCProvider;