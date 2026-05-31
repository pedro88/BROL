/**
 * Geolocation helpers for CommunityRequest matching.
 *
 * - `geocodePostalCode`: postal code → coords via Zippopotam.us (no auth, no cache).
 * - `haversineSql`: Prisma.sql fragment for radius matching in raw queries.
 *
 * @package @brol/api
 */

import { Prisma } from "@prisma/client";

const ZIPPO_BASE_URL = "https://api.zippopotam.us";
const ZIPPO_TIMEOUT_MS = 3000;
const ZIPPO_RETRIES = 1; // 1 retry on 5xx/network = 2 total attempts

export type GeocodeResult = {
  lat: number;
  lng: number;
  city: string;
};

type ZippoPlace = {
  "place name": string;
  latitude: string;
  longitude: string;
};

type ZippoResponse = {
  "post code": string;
  country: string;
  "country abbreviation": string;
  places: ZippoPlace[];
};

function isValidCountry(country: string): boolean {
  return /^[A-Z]{2}$/.test(country);
}

function isValidPostalCode(postalCode: string): boolean {
  return /^[A-Za-z0-9 -]{3,10}$/.test(postalCode);
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve a postal code to coordinates and city via Zippopotam.us.
 *
 * Returns `null` if the postal code is unknown (404).
 * Throws `Error` on persistent network/5xx failures (after retries).
 *
 * @param country ISO-3166 alpha-2 (e.g. "BE", "FR")
 * @param postalCode Raw postal code as user-typed
 */
export async function geocodePostalCode(
  country: string,
  postalCode: string,
): Promise<GeocodeResult | null> {
  const normalizedCountry = country.toUpperCase();
  if (!isValidCountry(normalizedCountry) || !isValidPostalCode(postalCode)) {
    return null;
  }

  const url = `${ZIPPO_BASE_URL}/${normalizedCountry.toLowerCase()}/${encodeURIComponent(postalCode.trim())}`;

  let lastError: unknown;
  for (let attempt = 0; attempt <= ZIPPO_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url, ZIPPO_TIMEOUT_MS);
      if (res.status === 404) return null;
      if (res.status >= 500) {
        lastError = new Error(`Zippopotam ${res.status}`);
        continue;
      }
      if (!res.ok) {
        throw new Error(`Zippopotam ${res.status}`);
      }
      const data = (await res.json()) as ZippoResponse;
      const place = data.places?.[0];
      if (!place) return null;
      const lat = parseFloat(place.latitude);
      const lng = parseFloat(place.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return { lat, lng, city: place["place name"] };
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(
    `geocodePostalCode failed for ${normalizedCountry}/${postalCode}: ${String(lastError)}`,
  );
}

/**
 * Prisma.sql fragment selecting rows within `radiusKm` of (`lat`, `lng`).
 *
 * Assumes the queried table has columns `lat` and `lng` as DOUBLE PRECISION.
 * Uses the Haversine formula (earth radius 6371 km). Accurate within ~0.5%.
 *
 * Usage in raw query:
 *   await prisma.$queryRaw`
 *     SELECT "id" FROM "users"
 *     WHERE "lat" IS NOT NULL AND "lng" IS NOT NULL
 *       AND ${haversineSql(lat, lng, radiusKm)}
 *   `;
 */
export function haversineSql(lat: number, lng: number, radiusKm: number): Prisma.Sql {
  return Prisma.sql`
    6371 * acos(
      cos(radians(${lat})) * cos(radians("lat"))
      * cos(radians("lng") - radians(${lng}))
      + sin(radians(${lat})) * sin(radians("lat"))
    ) <= ${radiusKm}
  `;
}

/**
 * Pure Haversine distance in km between two coords. Useful for tests
 * and for annotating notification payloads with the matched distance.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
