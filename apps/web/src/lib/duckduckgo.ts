/**
 * Client DuckDuckGo Images.
 * Recherche d'images via l'API proxy Next.js (/api/search-images).
 * Le scraping HTML est fait côté serveur pour éviter les blocages CORS.
 * @package @brol/web
 */

export interface ImageResult {
  /** URL de l'image en plein format */
  url: string;
  /** Titre de l'image / source */
  title: string;
}

const API_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "";

/**
 * Cherche des images via l'API proxy Next.js.
 * L'API proxy fait le scraping côté serveur (pas de CORS).
 *
 * @param query - Terme de recherche
 * @param options - Options (limit, etc.)
 */
export async function searchDuckDuckGoImages(
  query: string,
  options: { limit?: number } = {}
): Promise<ImageResult[]> {
  const limit = options.limit ?? 20;

  // Construire l'URL de l'API proxy.
  // En dev: NEXT_PUBLIC_APP_URL="http://localhost:3000" → /api/search-images fonctionne.
  // En prod: l'app est servie depuis NEXT_PUBLIC_APP_URL.
  const apiBase =
    API_BASE ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });

    const response = await fetch(`${apiBase}/api/search-images?${params}`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[duckduckgo] API proxy returned ${response.status} for: ${query}`);
      return [];
    }

    const data: ImageResult[] = await response.json();
    return data;
  } catch (err) {
    console.error("[duckduckgo] Search failed:", err);
    return [];
  }
}

/**
 * Proxy une URL d'image via DuckDuckGo pour éviter les blocages CORS.
 * L'URL retournée peut être utilisée directement dans un <img>.
 * Format: https://duckduckgo.com/iu/?u=<encoded_url>
 *
 * Note: ce proxy est pour les images elles-mêmes, pas pour la recherche.
 */
export function proxyImageUrl(imageUrl: string): string {
  return `https://duckduckgo.com/iu/?u=${encodeURIComponent(imageUrl)}`;
}
