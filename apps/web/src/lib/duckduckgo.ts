/**
 * Client DuckDuckGo Images.
 * Recherche d'images via scraping de la page DuckDuckGo Images.
 * @package @brol/web
 */

export interface ImageResult {
  /** URL de l'image en plein format */
  url: string;
  /** URL de la miniature (si disponible) */
  thumbnail?: string;
  /** Titre de l'image / source */
  title: string;
  /** URL de la page source */
  source?: string;
}

/**
 * Cherche des images via DuckDuckGo.
 *
 * Stratégie:
 * 1. On fait une requête GET vers la page DuckDuckGo Images avec le query
 * 2. On parse le HTML pour extraire les URLs des images (via regex sur les données JSON embarquées)
 * 3. On retourne un tableau d'images avec url, title, thumbnail
 *
 * Note: DuckDuckGo ne fournit pas d'API officielle pour les images,
 * donc on scrape la page. Cette approche est fragile — à surveiller si
 * la structure HTML change.
 */
export async function searchDuckDuckGoImages(
  query: string,
  options: { limit?: number } = {}
): Promise<ImageResult[]> {
  const limit = options.limit ?? 20;

  const encodedQuery = encodeURIComponent(query);
  const url = `https://duckduckgo.com/?q=${encodedQuery}&ia=web&iaimages=image`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`[duckduckgo] HTTP ${response.status} for query: ${query}`);
      return [];
    }

    const html = await response.text();

    // DuckDuckGo embarque les résultats d'images dans du JSON embarqué dans le HTML
    // Recherche du pattern: "image":"https://..." ou "Image":"https://..."
    const results: ImageResult[] = [];

    // Pattern 1: JSON embarqué avec les résultats d'images
    // Cherche les blocs qui ressemblent à des URLs d'images
    const imageUrlPatterns = [
      // Pattern: "image":"https://..."
      /"image":"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif))"/gi,
      // Pattern: "src":"https://..." dans les résultats d'images
      /"src":"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif))"/gi,
      // Pattern: data-src="https://..." (lazy loading)
      /data-src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif))"/gi,
    ];

    const seenUrls = new Set<string>();

    for (const pattern of imageUrlPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const url = match[1];
        if (!seenUrls.has(url) && isValidImageUrl(url)) {
          seenUrls.add(url);
          results.push({
            url,
            title: query,
          });
          if (results.length >= limit) break;
        }
      }
      if (results.length >= limit) break;
    }

    // Pattern 2: chercher dans les scripts JSON qui contiennent les résultats
    // DuckDuckGo stocke parfois les résultats dans des variables JavaScript
    const jsonScriptPattern = /window\.__json\w*\s*=\s*(\{[\s\S]*?\});/;
    const scriptMatches = html.match(jsonScriptPattern);
    if (scriptMatches && results.length < limit) {
      for (const script of scriptMatches) {
        const jsonMatch = script.match(/=\s*(\{.*)/);
        if (jsonMatch) {
          try {
            // Chercher les URLs dans le JSON
            const urlInJson = jsonMatch[1].match(
              /https?:\/\/[^\s"',]+\.(?:jpg|jpeg|png|webp|gif)/gi
            );
            if (urlInJson) {
              for (const url of urlInJson) {
                if (!seenUrls.has(url) && isValidImageUrl(url)) {
                  seenUrls.add(url);
                  results.push({ url, title: query });
                  if (results.length >= limit) break;
                }
              }
            }
          } catch {
            // JSON parse failed — ignore this script block
          }
        }
        if (results.length >= limit) break;
      }
    }

    // Pattern 3: URL de thumbnails dans les résultats RDF
    // DuckDuckGo utilise parfois des URLs optimisées avec i.ntic.be
    const thumbnailPattern =
      /i\.duckduckgo\.com\/iu\/\?u=(https?[^&"]+)/gi;
    let match;
    while ((match = thumbnailPattern.exec(html)) !== null && results.length < limit) {
      const url = decodeURIComponent(match[1]);
      if (!seenUrls.has(url) && isValidImageUrl(url)) {
        seenUrls.add(url);
        results.push({ url, title: query });
      }
    }

    return results.slice(0, limit);
  } catch (err) {
    console.error("[duckduckgo] Search failed:", err);
    return [];
  }
}

/**
 * Filtre les URLs d'images valides (évite les spacers, trackers, etc.)
 */
function isValidImageUrl(url: string): boolean {
  // Exclure les URLs trop courtes ou avec des patterns suspects
  const excludedPatterns = [
    /duckduckgo\.com\/assets\//i,
    /\/spacer\//i,
    /\/transparent\.gif/i,
    /data:image\//i,
    /localhost/i,
    /\.ico$/i,
    /favicon/i,
    /logo/i,
  ];

  if (excludedPatterns.some((p) => p.test(url))) {
    return false;
  }

  // URLs doivent être suffisamment longues pour être réelles
  if (url.length < 50) {
    return false;
  }

  return true;
}

/**
 * Proxy une URL d'image via DuckDuckGo pour éviter les blocages CORS.
 * L'URL retournée peut être utilisée directement dans un <img>.
 * Format: https://duckduckgo.com/iu/?u=<encoded_url>
 */
export function proxyImageUrl(imageUrl: string): string {
  return `https://duckduckgo.com/iu/?u=${encodeURIComponent(imageUrl)}`;
}
