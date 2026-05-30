/**
 * Provider tRPC pour envelopper l'application.
 * @package @brol/web
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@brol/api";
import { useEffect, useState } from "react";
import { getSessionToken, sessionTokenStore } from "./auth-store";
import { trpc } from "./trpc";

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
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/trpc`
            : "http://localhost:3001/api/trpc",
          headers() {
            const token = getSessionToken();
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    }),
  );

  // Invalide les queries quand le token de session change (sign-in ou
  // sync différé par AuthSessionSyncer). Sans ça, les queries qui se
  // sont firées AVANT que le token soit dispo restent en cache en mode
  // anonyme — c'est ce qui faisait que `objects.getPublic` retournait
  // `isOwner=false` même après authentification.
  useEffect(() => {
    let prev = sessionTokenStore.get();
    const unsub = sessionTokenStore.subscribe((token) => {
      if (token !== prev) {
        prev = token;
        queryClient.invalidateQueries();
      }
    });
    return () => {
      unsub();
    };
  }, [queryClient]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
