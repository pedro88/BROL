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

  // Purge les queries quand le token de session change (sign-in/out
  // ou sync différé par AuthSessionSyncer). On utilise `removeQueries`
  // plutôt que `invalidateQueries` : invalidate marque stale mais sert
  // toujours la data cachée pendant le refetch — du coup le user
  // suivant voyait brièvement les données du user précédent (ex:
  // `users.me.postalCode` de l'ancien user → redirect home par
  // erreur sur /onboarding/location). `removeQueries` purge la cache
  // → les queries en cours repartent en `isLoading` jusqu'au refetch.
  useEffect(() => {
    let prev = sessionTokenStore.get();
    const unsub = sessionTokenStore.subscribe((token) => {
      if (token !== prev) {
        prev = token;
        queryClient.removeQueries();
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
