/**
 * BetterAuth route handler for Next.js App Router.
 * Mounts BetterAuth at /api/auth/* with nextCookies plugin
 * for automatic session cookie sync with Next.js.
 *
 * @package @brol/web
 */

import { toNextJsHandler } from "better-auth/next-js";
import { nextCookies } from "better-auth/next-js";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { google, github, apple } from "better-auth/social-providers";
import { prisma } from "@brol/db";

/**
 * BetterAuth instance for Next.js.
 * Includes nextCookies plugin to sync session cookies with Next.js.
 */
const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  basePath: "/api/auth",
  socialProviders: {
    // @ts-ignore - better-auth type mismatch: google() returns provider object
    // but BetterAuth's socialProviders type expects AwaitableFunction
    google: google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    // @ts-ignore
    github: github({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    // @ts-ignore
    apple: apple({
      clientId: process.env.APPLE_CLIENT_ID ?? "",
      clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
    }),
  },
  plugins: [nextCookies()],
});

/**
 * Export GET and POST handlers for Next.js Route Handler.
 * toNextJsHandler wraps BetterAuth's handler into Next.js route format.
 */
const handler = toNextJsHandler(auth);
export const { GET, POST } = handler;