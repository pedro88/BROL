/**
 * Provider tRPC pour envelopper l'application.
 * @package @brol/web
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
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
          transformer: superjson,
          url: process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/trpc`
            : "http://localhost:3001/api/trpc",
          // Send the BetterAuth session cookie with every tRPC call.
          // Without this, auth depended entirely on the Bearer token in the
          // in-memory store, which AuthSessionSyncer populates *async* after
          // mount — so the dashboard's first query wave fired unauthenticated
          // and 401'd (stuck on "..."). The cookie is set synchronously at
          // sign-in, so it authenticates the very first request. Same-site
          // (localhost:3000↔3001, app↔api.brol.dev) so the Lax cookie is sent;
          // CORS already returns Allow-Credentials. Bearer header kept for
          // React Native (no cookie jar).
          fetch(url, options) {
            return fetch(url, { ...options, credentials: "include" });
          },
          headers() {
            const token = getSessionToken();
            // Locale courante (cookie brol_locale) → en-tête pour les messages
            // serveur localisés (erreurs tRPC).
            const locale =
              typeof document !== "undefined"
                ? document.cookie.match(/(?:^|;\s*)brol_locale=([^;]+)/)?.[1]
                : undefined;
            return {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              ...(locale ? { "x-locale": locale } : {}),
            };
          },
        }),
      ],
    }),
  );

  // Purge + refetch les queries quand le token de session change (sign-in/out
  // ou sync différé par AuthSessionSyncer). On utilise `resetQueries` :
  // - `invalidateQueries` marque stale mais sert la data cachée pendant le
  //   refetch → le user suivant voyait brièvement les données du précédent.
  // - `removeQueries` purge la cache mais NE relance PAS les observers actifs
  //   → les queries qui avaient 401 (token pas encore synced) restaient
  //   bloquées en `isLoading` ("..." sur le dashboard, jamais de chiffres).
  // `resetQueries` fait les deux : revert à l'état initial (pas de data stale)
  // ET refetch les queries montées → les stats se chargent dès que le token
  // arrive.
  useEffect(() => {
    let prev = sessionTokenStore.get();
    const unsub = sessionTokenStore.subscribe((token) => {
      if (token !== prev) {
        prev = token;
        void queryClient.resetQueries();
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
