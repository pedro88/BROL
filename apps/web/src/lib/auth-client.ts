/**
 * BetterAuth client for the Next.js web app.
 * All OAuth sign-in/out calls go through this client.
 *
 * @package @brol/web
 */

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    const win = window as unknown as Record<string, string>;
    return (
      win["__NEXT_PUBLIC_APP_URL__"] ??
      win["NEXT_PUBLIC_APP_URL"] ??
      "http://localhost:3000"
    );
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000"
  );
}

const baseUrl = getBaseUrl();

/**
 * Initiates OAuth sign-in for the given provider.
 * Redirects the browser to the provider's consent page.
 */
export async function oauthSignIn(
  provider: "google" | "github" | "apple",
  callbackUrl?: string,
) {
  const url = new URL(`/sign-in/${provider}`, baseUrl);
  if (callbackUrl) url.searchParams.set("callbackUrl", callbackUrl);
  window.location.href = url.toString();
}

/**
 * Signs out the current session and clears the session cookie.
 */
export async function oauthSignOut() {
  await fetch(`${baseUrl}/api/auth/sign-out`, {
    method: "POST",
    credentials: "include",
  });
}

/**
 * Fetches the current session from BetterAuth.
 * Returns the session object or null if not authenticated.
 */
export async function getSession() {
  try {
    const res = await fetch(`${baseUrl}/api/auth/get-session`, {
      credentials: "include",
    });
    return res.json();
  } catch {
    return null;
  }
}