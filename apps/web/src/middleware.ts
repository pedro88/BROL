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

/**
 * Paths exemptés de la soft gate "localisation requise".
 * L'utilisateur peut atteindre /onboarding/location pour compléter son profil,
 * et /settings pour le modifier après coup. Les API et assets sont aussi
 * exemptés (gate UI uniquement).
 */
const LOCATION_GATE_EXEMPT = [
  "/onboarding",
  "/settings",
  "/api",
  "/sign-in",
];

/** Nom du cookie indiquant que l'utilisateur a complété sa localisation. */
const LOC_COOKIE_NAME = "brol_loc_complete";

/**
 * Lit le cookie de session Better-auth.
 *
 * En prod (HTTPS), Better-auth utilise le préfixe `__Secure-` (et `__Host-`
 * pour les cookies non cross-subdomain). En dev local (HTTP), il utilise le
 * nom brut. On essaie les deux pour rester robuste.
 */
function getSessionCookie(request: NextRequest) {
  return (
    request.cookies.get("__Secure-better-auth.session_token") ??
    request.cookies.get("__Host-better-auth.session_token") ??
    request.cookies.get("better-auth.session_token")
  );
}

function hasLocationCookie(request: NextRequest) {
  return request.cookies.get(LOC_COOKIE_NAME)?.value === "1";
}

function isLocationGateExempt(pathname: string) {
  return LOCATION_GATE_EXEMPT.some((p) => pathname.startsWith(p));
}

const PROTECTED_PATTERNS = [
  "/collections",
  "/objects",
  "/settings",
  "/loans",
  "/scan",
  "/contacts",
  "/notifications",
  "/onboarding",
];

/**
 * Construit une URL absolue en respectant les headers de proxy.
 *
 * Next.js standalone derrière nginx/Cloudflare construit `request.url` à
 * partir de `process.env.HOSTNAME + ':' + PORT` (ici `127.0.0.1:3000`), pas
 * du Host original. On lit donc explicitement x-forwarded-host / x-forwarded-proto.
 */
function buildAbsoluteUrl(request: NextRequest, pathname: string) {
  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  // Fallback : si aucun header proxy (dev local), on utilise request.nextUrl
  if (!forwardedHost) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    return url;
  }

  return new URL(`${forwardedProto}://${forwardedHost}${pathname}`);
}

function redirectToSignIn(request: NextRequest, callbackPath: string) {
  const loginUrl = buildAbsoluteUrl(request, "/sign-in");
  loginUrl.searchParams.set("callbackUrl", callbackPath);
  return NextResponse.redirect(loginUrl);
}

function redirectToOnboardingLocation(request: NextRequest) {
  return NextResponse.redirect(buildAbsoluteUrl(request, "/onboarding/location"));
}

/**
 * Soft gate localisation : si l'utilisateur a une session mais n'a pas encore
 * complété sa localisation (cookie absent), redirige vers /onboarding/location
 * — sauf si le path est déjà dans la liste d'exemption.
 *
 * Le cookie est posé par /onboarding/location au submit (ou si user.postalCode
 * existe déjà côté DB lors du chargement de la page).
 */
function locationGateRedirect(request: NextRequest, pathname: string): NextResponse | null {
  if (isLocationGateExempt(pathname)) return null;
  if (hasLocationCookie(request)) return null;
  return redirectToOnboardingLocation(request);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root page / → protected: redirect to sign-in if no session, show dashboard if logged in
  if (pathname === "/") {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return redirectToSignIn(request, pathname);
    }
    const gateRedirect = locationGateRedirect(request, pathname);
    if (gateRedirect) return gateRedirect;
    return NextResponse.next();
  }

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

  // /collections/[id]/edit is protected — require auth
  if (
    pathname.startsWith("/collections/") &&
    pathname.includes("/edit")
  ) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return redirectToSignIn(request, pathname);
    }
    return NextResponse.next();
  }

  // /collections/[id] is a detail page (public if collection isPublic).
  // Allow through — the page handles auth itself.
  if (pathname.startsWith("/collections/") && pathname !== "/collections") {
    return NextResponse.next();
  }

  // /profile/[id] is a public profile page (anyone can view).
  if (pathname.startsWith("/profile/")) {
    return NextResponse.next();
  }

  // Check for session cookie on protected paths
  for (const pattern of PROTECTED_PATTERNS) {
    if (pathname.startsWith(pattern)) {
      const sessionCookie = getSessionCookie(request);
      if (!sessionCookie) {
        return redirectToSignIn(request, pathname);
      }
      const gateRedirect = locationGateRedirect(request, pathname);
      if (gateRedirect) return gateRedirect;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
