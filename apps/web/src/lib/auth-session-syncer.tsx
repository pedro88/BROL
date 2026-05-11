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
 * Get the API base URL (standalone API server port).
 * Sessions are created by the standalone API (port 3001),
 * so we must read sessions from there.
 */
function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:3001"
    );
  }
  return "http://localhost:3001";
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
        // Use the standalone API URL so the session cookie (set for port 3001)
        // is included in the request. The Next.js /api/auth/ handler can't
        // read it because it's on a different port.
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/auth/get-session`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled) {
          // get-session returns { user, session }. The raw token for tRPC auth
          // is in data.session.token (BetterAuth v1.6 format).
          // For sign-in/sign-up responses, token is also at root level (data.token).
          const token = data?.session?.token ?? data?.token;
          setSessionToken(token ?? undefined);
        }
      } catch {
        // Non-critical — token might already be set, or network error.
        // Don't clear the token on transient errors.
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