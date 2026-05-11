/**
 * Proxy API pour la recherche d'images via DuckDuckGo.
 * Le fetch est fait côté serveur pour éviter les blocages CORS du browser.
 * @package @brol/web
 */

import { NextRequest, NextResponse } from "next/server";

export interface ImageResult {
  url: string;
  title: string;
}

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Filtre les URLs d'images valides.
 */
function isValidImageUrl(url: string): boolean {
  if (url.length < 50) return false;
  const excluded = [
    /duckduckgo\.com\/assets\//i,
    /\/spacer\//i,
    /\/transparent\.gif/i,
    /data:image\//i,
    /localhost/i,
    /\.ico$/i,
    /favicon/i,
    /logo/i,
  ];
  if (excluded.some((p) => p.test(url))) return false;
  return true;
}

/**
 * Parse le HTML de DuckDuckGo pour extraire les URLs d'images.
 */
function extractImages(html: string, limit: number): ImageResult[] {
  const results: ImageResult[] = [];
  const seen = new Set<string>();

  // Pattern 1: JSON embarqué avec URLs d'images
  const patterns = [
    /"image":"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif))"/gi,
    /"src":"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif))"/gi,
    /data-src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif))"/gi,
    // Thumbnails DuckDuckGo
    /i\.duckduckgo\.com\/iu\/\?u=(https?[^&"]+)/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      // Decode URL if it's a DDG thumbnail
      if (url.includes("i.duckduckgo.com")) {
        try {
          url = decodeURIComponent(url);
        } catch {
          continue;
        }
      }
      if (!seen.has(url) && isValidImageUrl(url)) {
        seen.add(url);
        results.push({ url, title: "" });
        if (results.length >= limit) break;
      }
    }
    if (results.length >= limit) break;
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
  const encodedQuery = encodeURIComponent(query);
  const url = `https://duckduckgo.com/?q=${encodedQuery}&ia=web&iaimages=image`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`[search-images] DuckDuckGo HTTP ${response.status} for: ${query}`);
      return NextResponse.json([], { status: 200 });
    }

    const html = await response.text();
    const results = extractImages(html, limit);

    return NextResponse.json(results, {
      headers: {
        // Cache 5 minutes — évite de re-scraper à chaque frappe
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("[search-images] Failed:", err);
    return NextResponse.json([], { status: 200 }); // Retourne vide silencieusement
  }
}
