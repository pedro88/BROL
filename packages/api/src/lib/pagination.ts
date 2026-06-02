/**
 * Helpers for cursor-based pagination responses.
 *
 * The pattern `nextCursor: X.length === limit ? X[length-1]?.id ?? null : null`
 * (or its `take: limit+1; slice(0, -1)` cousin) is repeated in ~10
 * places. This module standardizes both flavors.
 *
 * @package @brol/api
 */

/**
 * Build a cursor-paginated response from a full slice (the "take N+1"
 * strategy). The caller is expected to have queried `take: limit + 1`
 * rows, then called this helper to extract the page and compute the
 * next cursor.
 *
 *   const rows = await prisma.foo.findMany({ take: input.limit + 1, ... });
 *   return pageOf(rows, input.limit);
 *
 * Returns `{ items, nextCursor }`. `nextCursor` is the id of the last
 * item IF there are more pages, otherwise `null`.
 */
export function pageOf<T extends { id: string }>(
  rows: T[],
  limit: number,
): { items: T[]; nextCursor: string | null } {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, -1) : rows;
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1]!.id : null;
  return { items, nextCursor };
}

/**
 * Build a cursor-paginated response from an already-clipped page
 * (the "take N and infer" strategy). The caller queries `take: limit`
 * rows, and the helper infers whether there's a next page by comparing
 * the result length to the limit.
 *
 *   const items = await prisma.foo.findMany({ take: input.limit, ... });
 *   return cursorOf(items, input.limit);
 *
 * Returns `{ items, nextCursor }`. The contract is the same as
 * `pageOf` — `nextCursor` is null when there's no next page.
 */
export function cursorOf<T extends { id: string }>(
  items: T[],
  limit: number,
): { items: T[]; nextCursor: string | null } {
  const hasMore = items.length === limit;
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1]!.id : null;
  return { items, nextCursor };
}
