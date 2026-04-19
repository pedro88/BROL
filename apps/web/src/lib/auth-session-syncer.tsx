/**
 * Component that syncs the BetterAuth session token to a global store.
 * Mounted once in Providers to keep the token in sync across the app.
 * The token is read by the tRPC headers link to auth API requests.
 *
 * @package @brol/web
 */

"use client";

import { useEffect, useRef } from "react";
import { setSessionToken } from "./auth-store";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    const win = window as unknown as Record<string, string>;
    return (
      win["__NEXT_PUBLIC_APP_URL__"] ??
      win["NEXT_PUBLIC_APP_URL"] ??
      "http://localhost:3000"
    );
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000"
  );
}

/**
 * Reads the session from BetterAuth /get-session endpoint and syncs the
 * token to the global store. Keeps the store in sync whenever the session
 * changes (sign-in, sign-out, token refresh).
 */
export function AuthSessionSyncer() {
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    const baseUrl = getBaseUrl();

    let cancelled = false;

    async function syncSession() {
      try {
        const res = await fetch(`${baseUrl}/api/auth/get-session`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled) {
          const token = data?.session?.token;
          setSessionToken(token ?? undefined);
        }
      } catch {
        if (!cancelled) setSessionToken(undefined);
      }
    }

    syncSession();

    // Poll every 30s to catch server-side token refreshes
    const interval = setInterval(syncSession, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return null;
}