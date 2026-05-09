"use client";

import { TRPCProvider } from "../lib/trpc-provider";
import { AuthSessionSyncer } from "../lib/auth-session-syncer";

/**
 * Providers wrapper for the application.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <AuthSessionSyncer />
      {children}
    </TRPCProvider>
  );
}
