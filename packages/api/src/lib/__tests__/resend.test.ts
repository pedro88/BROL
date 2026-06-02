/**
 * Tests for the singleton Resend client.
 *
 * Validates the env-var driven configuration, the `null` return when
 * the key is missing, and the singleton behavior (same instance on
 * repeated calls).
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Resend } from "resend";
import { getResendClient, getResendFromAddress, _resetResendClient } from "../resend";

describe("getResendClient", () => {
  const ORIGINAL_KEY = process.env.RESEND_API_KEY;
  const ORIGINAL_FROM = process.env.RESEND_FROM_EMAIL;

  beforeEach(() => {
    _resetResendClient();
  });

  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = ORIGINAL_KEY;
    if (ORIGINAL_FROM === undefined) delete process.env.RESEND_FROM_EMAIL;
    else process.env.RESEND_FROM_EMAIL = ORIGINAL_FROM;
    _resetResendClient();
  });

  it("returns null when RESEND_API_KEY is not set", () => {
    delete process.env.RESEND_API_KEY;
    expect(getResendClient()).toBeNull();
  });

  it("returns a Resend instance when RESEND_API_KEY is set", () => {
    process.env.RESEND_API_KEY = "test-key";
    const client = getResendClient();
    expect(client).toBeInstanceOf(Resend);
  });

  it("returns the same instance on repeated calls (singleton)", () => {
    process.env.RESEND_API_KEY = "test-key";
    const a = getResendClient();
    const b = getResendClient();
    expect(a).toBe(b);
  });

  it("logs nothing at info level on cache miss", () => {
    process.env.RESEND_API_KEY = "test-key";
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    getResendClient();
    // No warn expected for the happy path
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("getResendFromAddress", () => {
  const ORIGINAL = process.env.RESEND_FROM_EMAIL;

  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.RESEND_FROM_EMAIL;
    else process.env.RESEND_FROM_EMAIL = ORIGINAL;
  });

  it("returns the configured address when set", () => {
    process.env.RESEND_FROM_EMAIL = "Brol <hi@example.com>";
    expect(getResendFromAddress()).toBe("Brol <hi@example.com>");
  });

  it("falls back to a default when not set", () => {
    delete process.env.RESEND_FROM_EMAIL;
    expect(getResendFromAddress()).toBe("Brol <noreply@brol.app>");
  });
});
