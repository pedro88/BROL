/**
 * BetterAuth route handler for Next.js App Router.
 * Mounts BetterAuth at /api/auth/* with nextCookies plugin
 * for automatic session cookie sync with Next.js.
 *
 * /!\ Cette instance Better-auth tourne en parallèle de celle du serveur API
 * (packages/api/src/auth.ts). Les deux DOIVENT partager la même config
 * (secret, trustedOrigins, crossSubDomainCookies) pour que les sessions
 * soient interchangeables — sinon le cookie posé par l'API n'est pas
 * reconnu ici (ou inversement) et get-session renvoie 500.
 *
 * @package @brol/web
 */

import { toNextJsHandler, nextCookies } from "better-auth/next-js";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// OAuth providers — commented out for future use
// import { google, github, apple } from "better-auth/social-providers";
import { prisma } from "@brol/db";

/**
 * Construit la liste des origins acceptés par Better-auth.
 * Doit matcher celle de packages/api/src/auth.ts pour rester cohérent.
 * Extensible via BETTER_AUTH_TRUSTED_ORIGINS (séparés par virgule).
 */
function buildTrustedOrigins(): string[] {
  const envOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [
    "https://app.brol.dev",
    "https://api.brol.dev",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8081",
    "http://localhost:19006",
    ...envOrigins,
  ];
}

/**
 * Domaine de cookie partagé entre app.brol.dev et api.brol.dev.
 * Inclut implicitement `secure: true` côté Better-auth → cookie nommé
 * `__Secure-better-auth.session_token`. Le middleware lit les deux variantes.
 */
const cookieDomain = process.env.BETTER_AUTH_COOKIE_DOMAIN;

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  basePath: "/api/auth",
  trustedOrigins: buildTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  // Sans cet `additionalFields`, get-session ne renvoie qu'id/email/image.
  additionalFields: {
    user: {
      name: {
        type: "string",
        required: false,
        output: { type: "string", nullable: true },
      },
    },
  },
  // Cross-subdomain cookies — voir packages/api/src/auth.ts pour la motivation.
  // En dev local on laisse undefined (Better-auth utilisera le cookie host-only
  // sur localhost, ce qui suffit).
  advanced: cookieDomain
    ? {
        crossSubDomainCookies: {
          enabled: true,
          domain: cookieDomain,
        },
        defaultCookieAttributes: {
          sameSite: "lax",
          secure: true,
        },
      }
    : undefined,
  // OAuth providers — commented out for future use
  // socialProviders: {
  //   google: google({ clientId: process.env.GOOGLE_CLIENT_ID ?? "", clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "" }),
  //   github: github({ clientId: process.env.GITHUB_CLIENT_ID ?? "", clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "" }),
  //   apple:  apple({  clientId: process.env.APPLE_CLIENT_ID ?? "",  clientSecret: process.env.APPLE_CLIENT_SECRET ?? "" }),
  // },
  plugins: [nextCookies()],
});

/**
 * Export GET and POST handlers for Next.js Route Handler.
 */
const handler = toNextJsHandler(auth);
export const { GET, POST } = handler;
