/**
 * In-memory sliding-window rate limiter.
 *
 * Used for sign-in (anti-brute-force) and tRPC procedure quotas.
 * Single-instance only — resets on process restart, doesn't share state
 * across API replicas. For multi-instance, swap to Redis (Upstash) and
 * keep the public API (`check` / `reset`) identical.
 *
 * @package @brol/api
 */

import { logger } from "./logger";

const log = logger.child("rate-limit");

export interface RateLimiterOptions {
  /** Time window in milliseconds. */
  windowMs: number;
  /** Max allowed requests per key per window. */
  max: number;
  /** Name for log messages and metrics. */
  name: string;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Approximate remaining requests in the current window. */
  remaining: number;
  /** Unix ms when the oldest counted request will fall out of the window. */
  resetAt: number;
}

interface Bucket {
  /** Timestamps (ms) of requests inside the current window, oldest first. */
  hits: number[];
}

/**
 * Sliding-window counter: for each `key`, keep the timestamps of the last
 * `max` hits. A new request is allowed iff fewer than `max` timestamps fall
 * within `[now - windowMs, now]`.
 *
 * Old timestamps are dropped on every `check`, so memory stays bounded
 * to roughly `max` entries per active key. A periodic sweep prunes empty
 * buckets so abandoned keys don't pile up.
 */
export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly windowMs: number;
  private readonly max: number;
  private readonly name: string;
  private sweepTimer: ReturnType<typeof setInterval> | null = null;

  constructor(opts: RateLimiterOptions) {
    this.windowMs = opts.windowMs;
    this.max = opts.max;
    this.name = opts.name;
  }

  /**
   * Test-and-record. Always increments when allowed; never records on reject.
   * Returns metadata for the response (X-RateLimit-* headers).
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    const existing = this.buckets.get(key);

    if (!existing) {
      this.buckets.set(key, { hits: [now] });
      this.ensureSweep();
      return { allowed: true, remaining: this.max - 1, resetAt: now + this.windowMs };
    }

    // Drop expired hits from the front. `hits` is append-only so this is
    // amortized O(k) where k = expired count, not O(window).
    while (existing.hits.length > 0 && existing.hits[0]! <= cutoff) {
      existing.hits.shift();
    }

    if (existing.hits.length >= this.max) {
      const oldest = existing.hits[0]!;
      return {
        allowed: false,
        remaining: 0,
        resetAt: oldest + this.windowMs,
      };
    }

    existing.hits.push(now);
    return {
      allowed: true,
      remaining: this.max - existing.hits.length,
      resetAt: existing.hits[0]! + this.windowMs,
    };
  }

  /**
   * Forget a key (e.g. after a successful sign-in so a legitimate user
   * isn't penalized for typos before they got it right).
   */
  reset(key: string): void {
    this.buckets.delete(key);
  }

  /** Test-only: clear all state. */
  _clear(): void {
    this.buckets.clear();
  }

  private ensureSweep(): void {
    if (this.sweepTimer) return;
    // Sweep every max(windowMs, 30s) — cheap, prevents abandoned keys leaking.
    const interval = Math.max(this.windowMs, 30_000);
    this.sweepTimer = setInterval(() => this.sweep(), interval);
    // Don't keep the process alive just for sweeping.
    if (typeof this.sweepTimer === "object" && this.sweepTimer !== null) {
      (this.sweepTimer as { unref?: () => void }).unref?.();
    }
  }

  private sweep(): void {
    const cutoff = Date.now() - this.windowMs;
    let removed = 0;
    for (const [key, bucket] of this.buckets) {
      while (bucket.hits.length > 0 && bucket.hits[0]! <= cutoff) {
        bucket.hits.shift();
      }
      if (bucket.hits.length === 0) {
        this.buckets.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      log.debug("rate-limit sweep", { name: this.name, removed, remaining: this.buckets.size });
    }
  }
}

// =====================================================================
// Shared limiters (singleton)
// =====================================================================

/**
 * Sign-in (POST /api/auth/sign-in/*): 5 attempts / minute / IP.
 * Tight on purpose — protects against credential stuffing.
 */
export const signInLimiter = new RateLimiter({
  name: "sign-in",
  windowMs: 60_000,
  max: 5,
});

/**
 * tRPC reads (queries): 60 / minute / user. Generous for normal use
 * (browsing collections, opening object details, polling notifications).
 */
export const trpcReadLimiter = new RateLimiter({
  name: "trpc-read",
  windowMs: 60_000,
  max: 60,
});

/**
 * tRPC writes (mutations): 20 / minute / user. Tight enough to catch
 * abusive scripts, loose enough for legitimate bursts (multi-photo upload,
 * community-request matching with many notifications).
 */
export const trpcMutationLimiter = new RateLimiter({
  name: "trpc-mutation",
  windowMs: 60_000,
  max: 20,
});

// =====================================================================
// Key extraction
// =====================================================================

/**
 * Extract a client IP from request headers.
 *
 * Prefers `x-forwarded-for` (first hop when behind Cloudflare/nginx) then
 * falls back to `x-real-ip`. Returns "unknown" if neither is present —
 * callers should treat unknown keys as shared and apply their own cap.
 */
export function getClientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
  const get = (name: string): string | undefined => {
    if (headers instanceof Headers) {
      return headers.get(name) ?? undefined;
    }
    const v = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(v) ? v[0] : v;
  };

  const xff = get("x-forwarded-for");
  if (xff) {
    // XFF is a comma-separated list; the leftmost is the original client.
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = get("x-real-ip");
  if (xri) return xri.trim();

  return "unknown";
}
