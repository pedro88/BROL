/**
 * Tests du trail d'audit (lib/audit.ts).
 * @package @brol/api
 */

import { describe, it, expect } from "vitest";
import { logAudit, getClientIp } from "../audit";
import { prisma, createTestContext } from "../../test/setup";

describe("logAudit", () => {
  it("writes an audit row with all fields", async () => {
    const ctx = await createTestContext();

    await logAudit(prisma, {
      userId: ctx.userId,
      action: "sign_in",
      ipAddress: "203.0.113.7",
      userAgent: "vitest",
      metadata: { email: "x@y.z" },
    });

    const row = await prisma.auditLog.findFirst({
      where: { userId: ctx.userId, action: "sign_in" },
    });
    expect(row).not.toBeNull();
    expect(row!.ipAddress).toBe("203.0.113.7");
    expect(row!.userAgent).toBe("vitest");
    expect(row!.metadata).toEqual({ email: "x@y.z" });
  });

  it("accepts anonymous events (userId null) and missing metadata", async () => {
    await logAudit(prisma, { action: "sign_in_failed" });

    const row = await prisma.auditLog.findFirst({
      where: { action: "sign_in_failed" },
    });
    expect(row).not.toBeNull();
    expect(row!.userId).toBeNull();
    expect(row!.ipAddress).toBeNull();
  });

  it("is best-effort: a DB failure must NOT throw (audit ne casse pas l'op principale)", async () => {
    const broken = {
      auditLog: {
        create: () => {
          throw new Error("db down");
        },
      },
    } as never;

    await expect(
      logAudit(broken, { action: "sign_out", userId: "whatever" })
    ).resolves.toBeUndefined();
  });
});

describe("getClientIp", () => {
  it("takes the first IP of x-forwarded-for (client, pas les proxies)", () => {
    expect(
      getClientIp({ "x-forwarded-for": "198.51.100.1, 10.0.0.1, 10.0.0.2" })
    ).toBe("198.51.100.1");
  });

  it("handles array-valued x-forwarded-for", () => {
    expect(getClientIp({ "x-forwarded-for": ["198.51.100.2", "10.0.0.1"] })).toBe(
      "198.51.100.2"
    );
  });

  it("falls back to x-real-ip", () => {
    expect(getClientIp({ "x-real-ip": "192.0.2.9" })).toBe("192.0.2.9");
  });

  it("returns 'unknown' when no header is present", () => {
    expect(getClientIp({})).toBe("unknown");
  });

  it("trims whitespace around the forwarded IP", () => {
    expect(getClientIp({ "x-forwarded-for": "  198.51.100.3  ,10.0.0.1" })).toBe(
      "198.51.100.3"
    );
  });
});
