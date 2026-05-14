/**
 * Badge service — logique d'attribution des badges.
 * @package @brol/api
 */

import type { PrismaClient } from "@prisma/client";

export const TIER_LIMITS_BADGES = {
  FREE: { collections: 5, objects: 50, activeLoans: 10 },
  TIER_2: { collections: 10, objects: 500, activeLoans: 50 },
  TIER_3: { collections: null, objects: null, activeLoans: null },
} as const;

type Tier = keyof typeof TIER_LIMITS_BADGES;

/**
 * Calcule et award les badges pour un utilisateur.
 * Appelé après chaque prêt, ajout d'objet ou review.
 */
export async function syncUserBadges(prisma: PrismaClient, userId: string): Promise<string[]> {
  const [loanCount, objectCount, reviewCount, avgRating] = await Promise.all([
    prisma.loan.count({
      where: { OR: [{ ownerId: userId }, { borrowerId: userId }] },
    }),
    prisma.object.count({ where: { collection: { userId } } }),
    prisma.review.count({ where: { authorId: userId } }),
    prisma.review.aggregate({
      where: { targetId: userId },
      _avg: { rating: true },
    }),
  ]);

  const stats = {
    loanCount,
    objectCount,
    reviewCount,
    avgRating: avgRating._avg.rating ?? 0,
  };

  const definitions = await prisma.badgeDefinition.findMany();
  const awarded: string[] = [];

  for (const def of definitions) {
    const criteria = def.criteria as { type: string; threshold: number };
    let earned = false;

    switch (criteria.type) {
      case "loan_count":
        earned = stats.loanCount >= criteria.threshold;
        break;
      case "object_count":
        earned = stats.objectCount >= criteria.threshold;
        break;
      case "review_count":
        earned = stats.reviewCount >= criteria.threshold;
        break;
      case "avg_rating":
        earned = stats.avgRating >= criteria.threshold;
        break;
    }

    if (earned) {
      try {
        await prisma.userBadge.create({
          data: { userId, badgeId: def.id },
        });
        awarded.push(def.slug);
      } catch {
        // Déjà présent — ignore
      }
    }
  }

  return awarded;
}
