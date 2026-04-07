/**
 * Configuration tRPC pour le frontend Next.js.
 * @package @brol/web
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@brol/api";

/**
 * Client tRPC React pour une utilisation avec React Query.
 */
export const trpc = createTRPCReact<AppRouter>();
