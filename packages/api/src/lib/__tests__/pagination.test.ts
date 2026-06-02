/**
 * Tests for the cursor pagination helpers.
 *
 * Covers both flavors in `lib/pagination.ts`:
 *   - `pageOf` for the "take N+1, slice off the extra" strategy
 *   - `cursorOf` for the "take N, infer from length" strategy
 *
 * @package @brol/api
 */

import { describe, it, expect } from "vitest";
import { pageOf, cursorOf } from "../pagination";

const row = (id: string) => ({ id, name: `row-${id}` });

describe("pageOf (take N+1 strategy)", () => {
  it("returns all rows and no cursor when fewer than limit", () => {
    const r = pageOf([row("a"), row("b")], 5);
    expect(r.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(r.nextCursor).toBeNull();
  });

  it("returns all rows and no cursor when exactly at limit", () => {
    const r = pageOf([row("a"), row("b")], 2);
    expect(r.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(r.nextCursor).toBeNull();
  });

  it("clips the extra row when over limit and exposes its id as cursor", () => {
    const r = pageOf([row("a"), row("b"), row("c")], 2);
    expect(r.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(r.nextCursor).toBe("b");
  });

  it("handles an empty input", () => {
    expect(pageOf([], 5)).toEqual({ items: [], nextCursor: null });
  });
});

describe("cursorOf (take N strategy)", () => {
  it("returns rows and no cursor when fewer than limit", () => {
    const r = cursorOf([row("a"), row("b")], 5);
    expect(r.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(r.nextCursor).toBeNull();
  });

  it("exposes the last id as cursor when exactly at limit (next page MAY exist)", () => {
    const r = cursorOf([row("a"), row("b")], 2);
    expect(r.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(r.nextCursor).toBe("b");
  });

  it("handles an empty input", () => {
    expect(cursorOf([], 5)).toEqual({ items: [], nextCursor: null });
  });
});
