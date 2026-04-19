/**
 * Route protection middleware.
 * Redirects unauthenticated users to /sign-in for protected routes.
 * Excludes: /sign-in, /api/auth/*, static assets, _next.
 *
 * @package @brol/web
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/sign-in",
  "/api/auth",
  "/browse",
];

const PROTECTED_PATTERNS = [
  "/collections",
  "/objects",
  "/settings",
  "/loans",
  "/scan",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  for (const publicPath of PUBLIC_PATHS) {
    if (pathname.startsWith(publicPath)) {
      return NextResponse.next();
    }
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // /collections is a list page (protected). /collections/[id] is a detail page (public if collection isPublic).
  // Allow /collections/[id] through — the page handles auth itself
  if (pathname.startsWith("/collections/") && pathname !== "/collections") {
    return NextResponse.next();
  }

  // Check for session cookie on protected paths
  for (const pattern of PROTECTED_PATTERNS) {
    if (pathname.startsWith(pattern)) {
      const sessionCookie = request.cookies.get("better-auth.session_token");
      if (!sessionCookie) {
        const loginUrl = new URL("/sign-in", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};