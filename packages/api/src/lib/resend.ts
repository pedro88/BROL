/**
 * Singleton Resend client.
 *
 * One client per process — Resend's SDK is stateless but allocating one
 * per email adds overhead. The `getResendClient()` helper returns null
 * if `RESEND_API_KEY` is missing so callers can branch on "email
 * disabled" without try/catching configuration errors.
 *
 * @package @brol/api
 */

import { Resend } from "resend";
import { logger } from "./logger";

const log = logger.child("resend");

let _client: Resend | null | undefined;

/**
 * Returns the singleton Resend client, or `null` if `RESEND_API_KEY` is
 * not set. The first call instantiates the client; subsequent calls
 * return the cached instance.
 */
export function getResendClient(): Resend | null {
  if (_client !== undefined) return _client;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    log.warn("RESEND_API_KEY not configured — email sending disabled");
    _client = null;
    return null;
  }
  _client = new Resend(apiKey);
  return _client;
}

/**
 * Returns the configured `from` address or a sensible default.
 * Centralized here so changing the sender is a one-liner.
 */
export function getResendFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "Brol <noreply@brol.app>";
}

/** Test-only: forget the cached client. */
export function _resetResendClient(): void {
  _client = undefined;
}
