/**
 * Quota enforcement helper.
 * Uses TIER_LIMITS from tier.ts to check user quotas before mutations.
 * @package @brol/api
 */

import { TRPCError } from "@trpc/server";
import type { Context } from "../trpc";

/** Limites par tier — synchronisé avec tier.ts TIER_LIMITS */
const QUOTA_LIMITS = {
  FREE: { collections: 5, objects: 50, activeLoans: 10 },
  TIER_2: { collections: 10, objects: 500, activeLoans: 50 },
  TIER_3: { collections: null, objects: null, activeLoans: null },
} as const;

type Tier = keyof typeof QUOTA_LIMITS;
type Resource = "collections" | "objects" | "activeLoans";

async function getUserTier(prisma: Context["prisma"], userId: string): Promise<Tier> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { tier: true },
  });
  return (profile?.tier as Tier) ?? "FREE";
}

async function getCurrentCount(
  prisma: Context["prisma"],
  userId: string,
  resource: Resource
): Promise<number> {
  switch (resource) {
    case "collections":
      return prisma.collection.count({ where: { userId } });
    case "objects":
      return prisma.object.count({ where: { collection: { userId } } });
    case "activeLoans":
      return prisma.loan.count({
        where: { ownerId: userId, status: { in: ["ACTIVE", "OVERDUE"] } },
      });
  }
}

/**
 * Vérifie que l'utilisateur n'a pas atteint son quota pour une ressource.
 * Throw TRPCError FORBIDDEN si limite atteinte.
 */
export async function enforceQuota(
  ctx: Context,
  resource: Resource
): Promise<{ current: number; max: number | null }> {
  const tier = await getUserTier(ctx.prisma, ctx.userId!);
  const limits = QUOTA_LIMITS[tier];
  const max = limits[resource];

  if (max === null) {
    return { current: 0, max: null };
  }

  const current = await getCurrentCount(ctx.prisma, ctx.userId!, resource);

  if (current >= max) {
    const upgradeTo = tier === "FREE" ? "TIER_2" : null;
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        `Limite ${resource} atteinte (${current}/${max}). ` +
        (upgradeTo ? `Passez à TIER_2 pour continuer.` : ""),
    });
  }

  return { current, max };
}