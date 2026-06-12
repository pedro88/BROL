/**
 * TRPC Provider for React Native.
 * Wraps the app with tRPC + React Query.
 * Token is read from auth-atom at runtime.
 * @package @brol/mobile
 */

import { useState, useEffect, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc, getApiUrl } from "./trpc";
import { authAtom } from "./auth-store";
import i18n from "../i18n";
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@brol/api";

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

  // Get current token from auth atom
  const token = authAtom.get().sessionToken;

  // Create a new client whenever the token changes
  const [trpcClient] = useState(() => {
    return trpc.createClient({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: `${getApiUrl()}/api/trpc`,
          headers() {
            const currentToken = authAtom.get().sessionToken;
            const locale = i18n.language?.slice(0, 2);
            return {
              ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
              ...(locale ? { "x-locale": locale } : {}),
            };
          },
        }),
      ],
    });
  });

  // Force a re-render when auth changes
  const [, setVersion] = useState(0);
  useEffect(() => {
    return authAtom.subscribe(() => {
      setVersion((v) => v + 1);
    });
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

export default TRPCProvider;