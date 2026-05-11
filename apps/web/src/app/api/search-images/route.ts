/**
 * Proxy API pour la recherche d'images via Unsplash.
 * @package @brol/web
 */

import { NextRequest, NextResponse } from "next/server";

export interface ImageResult {
  url: string;
  title: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      { error: "UNSPLASH_ACCESS_KEY not configured" },
      { status: 503 }
    );
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[unsplash] API error ${response.status}: ${text}`);
      return NextResponse.json([], { status: 200 });
    }

    const data = (await response.json()) as {
      results: Array<{
        urls: { regular: string; small: string; thumb: string };
        description: string | null;
        alt_description: string | null;
        user: { name: string };
      }>;
    };

    const results: ImageResult[] = data.results.map((photo) => ({
      // regular est ~1080px, un bon équilibre qualité/taille
      url: photo.urls.regular,
      title: photo.alt_description ?? photo.description ?? query,
    }));

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("[unsplash] Search failed:", err);
    return NextResponse.json([], { status: 200 });
  }
}
