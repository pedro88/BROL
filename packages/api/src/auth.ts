/**
 * BetterAuth instance for the standalone API server.
 * Mounts at /api/auth with email + password authentication.
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

/**
 * BetterAuth auth instance for the API server.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
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
});

export default auth;

/**
 * Session type returned by better-auth.
 * Simplified to avoid type resolution issues during Next.js build.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BetterAuthSession = any;

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
    if (cookieSession) return cookieSession;

    // Fall back to Bearer token (used by tRPC client from web app)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token) {
        const dbSession = await prisma.session.findUnique({
          where: { sessionToken: token },
          include: { user: true },
        });
        if (dbSession && dbSession.expires > new Date()) {
          return {
            session: {
              id: dbSession.id,
              token: dbSession.sessionToken,
              userId: dbSession.userId,
              expiresAt: dbSession.expires,
            },
            user: {
              id: dbSession.user.id,
              email: dbSession.user.email,
              name: dbSession.user.name ?? null,
              emailVerified: !!dbSession.user.emailVerified,
              image: dbSession.user.avatarUrl ?? null,
            },
          };
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Creates a BetterAuth instance with additional plugins.
 * Used by the Next.js web app to add the nextCookies plugin.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAuthWithPlugins(additionalPlugins: any[] = []) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
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
    //     clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
    //   }),
    // },
    plugins: additionalPlugins,
  });
}
