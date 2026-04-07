"use client";

import { TRPCProvider } from "../lib/trpc-provider";

/**
 * Providers wrapper for the application.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
