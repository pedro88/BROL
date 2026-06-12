/**
 * Audit trail helper.
 * Logs sensitive operations to the AuditLog table.
 * @package @brol/api
 */

import type { Prisma, PrismaClient } from "@prisma/client";

export type AuditAction =
  | "sign_in"
  | "sign_out"
  | "password_change"
  | "account_delete"
  | "collection_delete"
  | "object_delete";

type AuditLogCreateInput = {
  userId?: string | null;
  action: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Prisma.InputJsonValue | null;
};

export async function logAudit(
  prisma: PrismaClient,
  event: AuditLogCreateInput
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: event.userId ?? null,
        action: event.action,
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ?? null,
        metadata: event.metadata ?? undefined,
      },
    });
  } catch (err) {
    // Best-effort: audit failure ne doit pas faire échouer l'opération principale
    console.error("[audit] failed to log event:", err);
  }
}

/**
 * Extrait l'IP client depuis les headers (x-forwarded-for ou x-real-ip).
 */
export function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  const forwarded = headers["x-forwarded-for"];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return ip.trim();
  }
  const realIp = headers["x-real-ip"];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }
  return "unknown";
}