/**
 * Provider tRPC pour envelopper l'application.
 * @package @brol/web
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { trpc } from "./trpc";
import { getSessionToken } from "./auth-store";
import { AuthSessionSyncer } from "./auth-session-syncer";

/**
 * Composant Provider qui enveloppent l'app.
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            retry: 1,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/trpc",
          transformer: superjson,
          headers: () => {
            const token = getSessionToken();
            if (!token) return {};
            return { Authorization: `Bearer ${token}` };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <AuthSessionSyncer />
      </QueryClientProvider>
    </trpc.Provider>
  );
}