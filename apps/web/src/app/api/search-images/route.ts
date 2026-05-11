/**
 * Proxy API pour la recherche d'images via DuckDuckGo.
 * @package @brol/web
 */

import { NextRequest, NextResponse } from "next/server";

export interface ImageResult {
  url: string;
  title: string;
}

/**
 * Cherche des images via l'API JSON de DuckDuckGo.
 * Endpoint: https://duckduckgo.com/ (version JSON lite)
 *
 * Stratégie:
 * 1. Fetch la page HTML de DuckDuckGo avec le paramètre ia=json
 * 2. Parse le JSON embarqué pour extraire les URLs d'images
 * 3. Retourne un tableau d'images
 */
async function searchViaJson(query: string, limit: number): Promise<ImageResult[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://duckduckgo.com/?q=${encodedQuery}&ia=web&iaimages=image&format=json`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "en-US,en;q=0.5",
      "X-Requested-With": "XMLHttpRequest",
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo returned ${response.status}`);
  }

  const html = await response.text();

  // DuckDuckGo embeds JSON data in a script tag
  // Pattern: window.__duckduckgo_favicons = {...}
  const faviconsMatch = html.match(/window\.__duckduckgo_favicons\s*=\s*(\[[^\]]+\]);/);

  if (faviconsMatch) {
    try {
      const favicons = JSON.parse(faviconsMatch[1]) as Array<{ u: string; n: string }>;
      return favicons
        .slice(0, limit)
        .filter((f) => f.u && f.u.startsWith("http"))
        .map((f) => ({
          url: f.u,
          title: f.n || query,
        }));
    } catch {
      // JSON parse failed — fall through
    }
  }

  // Fallback: extraire les URLs d'images depuis le HTML via les scripts de résultats
  const results: ImageResult[] = [];
  const seen = new Set<string>();

  // Pattern: les résultats d'images sont dans des blocs de données JSON dans le HTML
  // Cherche les URLs qui ressemblent à des images dans les scripts
  const imgPattern =
    /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?/gi;
  const matches = html.match(imgPattern) ?? [];

  for (const url of matches) {
    if (
      !seen.has(url) &&
      url.length > 50 &&
      !url.includes("duckduckgo.com/assets") &&
      !url.includes("spacer") &&
      !url.includes("transparent") &&
      !url.includes("favicon") &&
      !url.includes("logo")
    ) {
      seen.add(url);
      results.push({ url, title: query });
      if (results.length >= limit) break;
    }
  }

  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter 'q'" },
      { status: 400 }
    );
  }

  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  try {
    const results = await searchViaJson(query, limit);
    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("[search-images] Failed:", err);
    return NextResponse.json([], { status: 200 });
  }
}
