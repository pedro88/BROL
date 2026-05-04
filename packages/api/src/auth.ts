/**
 * BetterAuth configuration for the Brol monorepo.
 * A single source of truth for auth options, shared between:
 *  - the standalone API server (port 3001)
 *  - the Next.js web app (port 3000, via nextCookies plugin)
 *
 * OAuth providers (Google, GitHub, Apple) are commented out for future use.
 *
 * @package @brol/api
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// OAuth providers — commented out for future use
// import { google, github, apple } from "better-auth/social-providers";
import { prisma } from "@brol/db";

// ============================================================================
// Shared base config — both instances use the same options
// ============================================================================

export interface AuthOptions {
  database: ReturnType<typeof prismaAdapter>;
  secret: string | undefined;
  baseURL: string;
  basePath: "/api/auth";
  emailAndPassword: {
    enabled: true;
    minPasswordLength: 8;
    autoSignIn: true;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socialProviders?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins?: any[];
}

function baseAuthConfig(overrides?: {
  baseURL?: string;
  plugins?: AuthOptions["plugins"];
  socialProviders?: AuthOptions["socialProviders"];
}): Omit<AuthOptions, "baseURL"> & { baseURL: string } {
  return {
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: overrides?.baseURL ?? "http://localhost:3001",
    basePath: "/api/auth",
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      autoSignIn: true,
    },
    // OAuth providers — commented out for future use
    // socialProviders: {
    //   google: google({
    //     clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    //   }),
    //   github: github({
    //     clientId: process.env.GITHUB_CLIENT_ID ?? "",
    //     clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    //   }),
    //   apple: apple({
    //     clientId: process.env.APPLE_CLIENT_ID ?? "",
    //     clientSecret: async () => {
    //       const privateKeyPem = process.env.APPLE_PRIVATE_KEY;
    //       const teamId = process.env.APPLE_TEAM_ID;
    //       const clientId = process.env.APPLE_CLIENT_ID;
    //       const keyId = process.env.APPLE_KEY_ID;
    //       if (!privateKeyPem || !teamId || !clientId || !keyId) {
    //         throw new Error("Missing Apple OAuth env vars");
    //       }
    //       const { SignJWT, importPKCS8 } = await import("jose");
    //       const now = Math.floor(Date.now() / 1000);
    //       const signingKey = await importPKCS8(privateKeyPem, "ES256");
    //       return new SignJWT({ iss: teamId, iat: now, exp: now + 15777000, aud: "https://appleid.apple.com", sub: clientId })
    //         .setProtectedHeader({ alg: "ES256", kid: keyId })
    //         .setIssuedAt(now)
    //         .setExpirationTime(now + 15777000)
    //         .sign(signingKey);
    //     },
    //   }),
    // },
    ...overrides,
  };
}

/**
 * BetterAuth auth instance for the standalone API server (port 3001).
 */
export const auth = betterAuth(
  baseAuthConfig({
    baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  }) as Parameters<typeof betterAuth>[0], // eslint-disable-line @typescript-eslint/no-explicit-any
);

export default auth;

/**
 * Creates a BetterAuth instance with additional plugins.
 * Used by the Next.js web app (port 3000) to add the nextCookies plugin.
 */
export function createAuthWithPlugins(
  plugins: Parameters<typeof betterAuth>[0]["plugins"] = [],
) {
  return betterAuth(
    baseAuthConfig({
      baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      plugins,
    }) as Parameters<typeof betterAuth>[0], // eslint-disable-line @typescript-eslint/no-explicit-any
  );
}

// ============================================================================
// Session types & helpers
// ============================================================================

/** Structure of the session returned by getSession. */
export interface BetterAuthSession {
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
  };
  user: {
    id: string;
    email: string;
    name: string | null;
    emailVerified: boolean | null;
    image: string | null;
  };
}

/**
 * Get the current session from a Request object.
 * Checks cookies first, then falls back to Authorization Bearer header.
 */
export async function getSession(request: Request): Promise<BetterAuthSession | null> {
  try {
    // Try cookie-based session first
    const cookieSession = await auth.api.getSession({
      headers: request.headers,
    });
    if (cookieSession) return cookieSession as unknown as BetterAuthSession;

    // Fall back to Bearer token (used by tRPC client from web app)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token) {
        const dbSession = await prisma.session.findUnique({
          where: { token },
          include: { user: true },
        });
        if (dbSession && dbSession.expiresAt > new Date()) {
          return {
            session: {
              id: dbSession.id,
              token: dbSession.token,
              userId: dbSession.userId,
              expiresAt: dbSession.expiresAt,
            },
            user: {
              id: dbSession.user.id,
              email: dbSession.user.email,
              name: dbSession.user.name ?? null,
              emailVerified: dbSession.user.emailVerified ?? false,
              image: dbSession.user.avatarUrl ?? null,
            },
          };
        }
      }
    }

    return null;
  } catch (err) {
    console.error("[getSession] failed:", String(err));
    return null;
  }
}
