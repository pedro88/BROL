/**
 * Tests for the in-memory sliding-window rate limiter.
 *
 * Covers the spec'd behavior of the three shared limiters (sign-in, tRPC
 * read, tRPC mutation) plus edge cases (reset, multi-key isolation,
 * getClientIp header parsing).
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  RateLimiter,
  getClientIp,
  signInLimiter,
  trpcReadLimiter,
  trpcMutationLimiter,
} from "../rate-limit";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ name: "test", windowMs: 1000, max: 3 });
  });

  it("allows requests up to the max", () => {
    expect(limiter.check("k").allowed).toBe(true);
    expect(limiter.check("k").allowed).toBe(true);
    expect(limiter.check("k").allowed).toBe(true);
  });

  it("rejects once the max is reached", () => {
    limiter.check("k");
    limiter.check("k");
    limiter.check("k");
    const r = limiter.check("k");
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("isolates buckets per key", () => {
    limiter.check("alice");
    limiter.check("alice");
    limiter.check("alice");
    // alice is now full, but bob is still fresh
    expect(limiter.check("alice").allowed).toBe(false);
    expect(limiter.check("bob").allowed).toBe(true);
  });

  it("reports remaining count", () => {
    expect(limiter.check("k").remaining).toBe(2);
    expect(limiter.check("k").remaining).toBe(1);
    expect(limiter.check("k").remaining).toBe(0);
  });

  it("reset() lets the caller retry immediately", () => {
    limiter.check("k");
    limiter.check("k");
    limiter.check("k");
    expect(limiter.check("k").allowed).toBe(false);
    limiter.reset("k");
    expect(limiter.check("k").allowed).toBe(true);
  });

  it("releases the bucket after the window passes (sliding)", async () => {
    vi.useFakeTimers();
    try {
      limiter.check("k");
      limiter.check("k");
      limiter.check("k");
      expect(limiter.check("k").allowed).toBe(false);

      vi.advanceTimersByTime(1001);
      expect(limiter.check("k").allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("only releases slots whose hits fell out of the window", async () => {
    vi.useFakeTimers();
    try {
      limiter.check("k"); // t=0
      vi.advanceTimersByTime(500);
      limiter.check("k"); // t=500
      limiter.check("k"); // t=500
      expect(limiter.check("k").allowed).toBe(false); // t=500, 3 hits in [−500,500]

      // After 600ms, the first hit (t=0) is outside the window → 1 free slot.
      vi.advanceTimersByTime(600);
      expect(limiter.check("k").allowed).toBe(true); // 1 free, 2 hits remain
      expect(limiter.check("k").allowed).toBe(false); // 0 free
    } finally {
      vi.useRealTimers();
    }
  });

  it("resetAt reflects the oldest hit + window, not now", () => {
    const r1 = limiter.check("k"); // t=0 conceptually
    const r2 = limiter.check("k");
    // r2 is the second hit; resetAt is anchored on the OLDEST (r1)
    expect(r2.resetAt).toBe(r1.resetAt);
  });
});

describe("shared limiters (sanity)", () => {
  beforeEach(() => {
    signInLimiter._clear();
    trpcReadLimiter._clear();
    trpcMutationLimiter._clear();
  });

  it("signInLimiter caps at 5/min for the same key", () => {
    for (let i = 0; i < 5; i++) {
      expect(signInLimiter.check("ip:same").allowed).toBe(true);
    }
    expect(signInLimiter.check("ip:same").allowed).toBe(false);
  });

  it("trpcReadLimiter caps at 60/min for the same key", () => {
    for (let i = 0; i < 60; i++) {
      expect(trpcReadLimiter.check("u:same").allowed).toBe(true);
    }
    expect(trpcReadLimiter.check("u:same").allowed).toBe(false);
  });

  it("trpcMutationLimiter caps at 20/min for the same key", () => {
    for (let i = 0; i < 20; i++) {
      expect(trpcMutationLimiter.check("u:same").allowed).toBe(true);
    }
    expect(trpcMutationLimiter.check("u:same").allowed).toBe(false);
  });
});

describe("getClientIp", () => {
  it("picks the first hop from x-forwarded-for", () => {
    const h = new Headers({
      "x-forwarded-for": "203.0.113.1, 10.0.0.1, 10.0.0.2",
    });
    expect(getClientIp(h)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip", () => {
    const h = new Headers({ "x-real-ip": "198.51.100.7" });
    expect(getClientIp(h)).toBe("198.51.100.7");
  });

  it("returns 'unknown' when nothing is set", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });

  it("accepts a plain object form", () => {
    expect(getClientIp({ "x-forwarded-for": "1.2.3.4" })).toBe("1.2.3.4");
    expect(getClientIp({ "x-real-ip": "1.2.3.4" })).toBe("1.2.3.4");
  });

  it("ignores a string[] header (picks the first)", () => {
    expect(getClientIp({ "x-forwarded-for": ["1.2.3.4", "5.6.7.8"] })).toBe("1.2.3.4");
  });
});
