/**
 * User handle generation.
 * Format: "{slug}{4-random-digits}" e.g. "piet1234".
 * Slug derived from name (lowercased, alphanumeric only).
 * Retries on collision (each retry randomizes the suffix).
 *
 * @package @brol/api
 */

import type { PrismaClient } from "@prisma/client";

const FALLBACK_SLUG = "user";
const MAX_RETRIES = 20;
const SLUG_MAX_LEN = 16;

export function slugifyName(name: string | null | undefined): string {
  if (!name) return FALLBACK_SLUG;
  const slug = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, SLUG_MAX_LEN);
  return slug.length > 0 ? slug : FALLBACK_SLUG;
}

function randomSuffix(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

/**
 * Generate a unique handle for a user.
 * Throws if MAX_RETRIES exceeded (extremely unlikely with 10000 suffixes).
 */
export async function generateHandle(
  prisma: PrismaClient,
  name: string | null | undefined,
): Promise<string> {
  const slug = slugifyName(name);
  for (let i = 0; i < MAX_RETRIES; i++) {
    const candidate = `${slug}${randomSuffix()}`;
    const existing = await prisma.user.findUnique({
      where: { handle: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error(`Could not generate unique handle for slug "${slug}" after ${MAX_RETRIES} retries`);
}
