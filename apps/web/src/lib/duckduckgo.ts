/**
 * Client de recherche d'images.
 * Appelle l'API proxy /api/search-images (Unsplash côté serveur).
 *
 * @package @brol/web
 */

export interface ImageResult {
  url: string;
  title: string;
}

/**
 * Cherche des images via l'API proxy (Unsplash).
 */
export async function searchImages(
  query: string,
  options: { limit?: number } = {}
): Promise<ImageResult[]> {
  const limit = options.limit ?? 20;

  const apiBase =
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });

    const response = await fetch(`${apiBase}/api/search-images?${params}`, {
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      if (response.status === 503) {
        // UNSPLASH_ACCESS_KEY pas configuré
        console.warn("[search] Unsplash API non configurée — recherchez 'UNSPLASH_ACCESS_KEY' dans .env.example");
        return [];
      }
      console.warn(`[search] API returned ${response.status}`);
      return [];
    }

    const data = (await response.json()) as ImageResult[];
    return data;
  } catch (err) {
    console.error("[search] Search failed:", err);
    return [];
  }
}

/**
 * Proxy une URL d'image via DuckDuckGo pour éviter les blocages CORS.
 * Format: https://duckduckgo.com/iu/?u=<encoded_url>
 */
export function proxyImageUrl(imageUrl: string): string {
  return `https://duckduckgo.com/iu/?u=${encodeURIComponent(imageUrl)}`;
}
