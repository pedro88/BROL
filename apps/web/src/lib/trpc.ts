/**
 * Configuration tRPC pour le frontend Next.js.
 * Single source of truth — import from here in all components.
 * @package @brol/web
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@brol/api";

/**
 * Client tRPC React pour une utilisation avec React Query.
 * Used by both the provider (to create the client) and all components (hooks).
 */
export const trpc = createTRPCReact<AppRouter>();
