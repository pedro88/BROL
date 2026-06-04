"use client";

import { TRPCProvider } from "../lib/trpc-provider";
import { AuthSessionSyncer } from "../lib/auth-session-syncer";
import { ThemeSyncer } from "../lib/theme-syncer";
import { Toaster } from "sonner";

/**
 * Providers wrapper for the application.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <AuthSessionSyncer />
      <ThemeSyncer />
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: "font-mono text-sm",
          style: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          },
        }}
      />
      {children}
    </TRPCProvider>
  );
}
