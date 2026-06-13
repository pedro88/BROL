/**
 * Badge service — logique d'attribution des badges.
 * @package @brol/api
 */

import type { PrismaClient } from "@prisma/client";
import type { ObjectType } from "@prisma/client";

export const TIER_LIMITS_BADGES = {
  FREE: { collections: 5, objects: 50, activeLoans: 10 },
  TIER_2: { collections: 10, objects: 500, activeLoans: 50 },
  TIER_3: { collections: null, objects: null, activeLoans: null },
} as const;

type Tier = keyof typeof TIER_LIMITS_BADGES;

// ===========================================
// TYPES
// ===========================================

type CriteriaOperator = ">=" | "==" | ">" | "<" | "<=" | "!=" | "first" | "streak" | "between" | "contains";

interface BaseCriteria {
  threshold?: number;
  operator?: CriteriaOperator;
  params?: Record<string, unknown>;
}

interface ObjectByTypeCriteria extends BaseCriteria {
  type: "object_by_type";
  params: { objectType: ObjectType | string };
}

interface ObjectByConditionCriteria extends BaseCriteria {
  type: "object_by_condition";
  params: { condition: string };
}

interface ObjectWithPhotosCountCriteria extends BaseCriteria {
  type: "object_with_photos_count";
  params: { objectType?: ObjectType | string };
}

interface ObjectWithIsbnCountCriteria extends BaseCriteria {
  type: "object_with_isbn_count";
  params: { objectType?: ObjectType | string };
}

interface ObjectWithCautionCountCriteria extends BaseCriteria {
  type: "object_with_caution_count";
  params?: { objectType?: ObjectType | string };
}

interface ObjectWithRentalCountCriteria extends BaseCriteria {
  type: "object_with_rental_count";
  params?: { objectType?: ObjectType | string };
}

interface LoanAsOwnerCountCriteria extends BaseCriteria {
  type: "loan_as_owner_count";
  params?: { objectType?: ObjectType | string };
}

interface LoanAsBorrowerCountCriteria extends BaseCriteria {
  type: "loan_as_borrower_count";
  params?: { objectType?: ObjectType | string };
}

interface LoanCountCriteria extends BaseCriteria {
  type: "loan_count";
}

interface ObjectCountCriteria extends BaseCriteria {
  type: "object_count";
}

interface ReviewCountCriteria extends BaseCriteria {
  type: "review_count";
}

interface AvgRatingCriteria extends BaseCriteria {
  type: "avg_rating";
}

interface LoansWithinDaysCriteria extends BaseCriteria {
  type: "loans_within_days";
  params: { days: number; objectType?: ObjectType | string };
}

interface ObjectMaxByFieldCriteria extends BaseCriteria {
  type: "object_max_by_field";
  params: { objectType: ObjectType | string; field: "genre" | "series" };
}

interface ObjectByGenreValueCriteria extends BaseCriteria {
  type: "object_by_genre_value";
  params: { objectType: ObjectType | string; value: string };
}

interface ObjectByEditionMatchCriteria extends BaseCriteria {
  type: "object_by_edition_match";
  params: { objectType: ObjectType | string; contains: string };
}

interface OnTimeReturnsCountCriteria extends BaseCriteria {
  type: "on_time_returns_count";
}

interface LateReturnsCountCriteria extends BaseCriteria {
  type: "late_returns_count";
}

interface ActiveLoansCountCriteria extends BaseCriteria {
  type: "active_loans_count";
}

interface ReturnedLoansCountCriteria extends BaseCriteria {
  type: "returned_loans_count";
}

interface OverdueLoansCountCriteria extends BaseCriteria {
  type: "overdue_loans_count";
}

interface CollectionCountCriteria extends BaseCriteria {
  type: "collection_count";
}

interface PublicCollectionsCountCriteria extends BaseCriteria {
  type: "public_collections_count";
}

interface PrivateCollectionsCountCriteria extends BaseCriteria {
  type: "private_collections_count";
}

interface CollectionByTypeCriteria extends BaseCriteria {
  type: "collection_by_type";
  params: { objectType: ObjectType | string };
}

interface ReviewsReceivedCountCriteria extends BaseCriteria {
  type: "reviews_received_count";
}

interface ReviewsWithCommentCountCriteria extends BaseCriteria {
  type: "reviews_with_comment_count";
}

interface HighRatingReceivedCountCriteria extends BaseCriteria {
  type: "high_rating_received_count";
  params?: { minRating?: number };
}

interface PerfectRatingCountCriteria extends BaseCriteria {
  type: "perfect_rating_count";
}

interface ReviewsGivenWithCommentCriteria extends BaseCriteria {
  type: "reviews_given_with_comment";
}

interface ReviewsGivenCountCriteria extends BaseCriteria {
  type: "reviews_given_count";
}

interface ContactCountCriteria extends BaseCriteria {
  type: "contact_count";
}

interface ContactWithBorrowerCountCriteria extends BaseCriteria {
  type: "contact_with_borrower_count";
}

interface ContactAddedThisMonthCriteria extends BaseCriteria {
  type: "contact_added_this_month";
}

interface ContactMessageSentCountCriteria extends BaseCriteria {
  type: "contact_message_sent_count";
}

interface MessagesSentCountCriteria extends BaseCriteria {
  type: "messages_sent_count";
}

interface UnreadMessagesCountCriteria extends BaseCriteria {
  type: "unread_messages_count";
}

interface CommunityRequestsCountCriteria extends BaseCriteria {
  type: "community_requests_count";
}

interface RequestsFulfilledCountCriteria extends BaseCriteria {
  type: "requests_fulfilled_count";
}

interface RequestsFulfilledByCountCriteria extends BaseCriteria {
  type: "requests_fulfilled_by_count";
}

interface RequestMessagesCountCriteria extends BaseCriteria {
  type: "request_messages_count";
}

interface QrGeneratedCountCriteria extends BaseCriteria {
  type: "qr_generated_count";
}

interface QrUsedCountCriteria extends BaseCriteria {
  type: "qr_used_count";
}

interface TierUpgradesCountCriteria extends BaseCriteria {
  type: "tier_upgrades_count";
}

interface ProfileCompletePercentCriteria extends BaseCriteria {
  type: "profile_complete_percent";
}

interface HasAvatarCriteria extends BaseCriteria {
  type: "has_avatar";
}

interface HasBioCriteria extends BaseCriteria {
  type: "has_bio";
}

interface MemberSinceDaysCriteria extends BaseCriteria {
  type: "member_since_days";
  operator?: CriteriaOperator;
}

interface LoansThisMonthCriteria extends BaseCriteria {
  type: "loans_this_month";
}

interface ObjectsAddedThisMonthCriteria extends BaseCriteria {
  type: "objects_added_this_month";
}

interface ReviewsThisMonthCriteria extends BaseCriteria {
  type: "reviews_this_month";
}

interface LoanStreakCriteria extends BaseCriteria {
  type: "loan_streak";
}

interface BorrowingStreakCriteria extends BaseCriteria {
  type: "borrowing_streak";
}

interface ReturnedCountCriteria extends BaseCriteria {
  type: "returned_count";
}

interface HasAllObjectTypesCriteria extends BaseCriteria {
  type: "has_all_object_types";
}

interface BorrowedFromCountCriteria extends BaseCriteria {
  type: "borrowed_from_count";
}

interface LentToCountCriteria extends BaseCriteria {
  type: "lent_to_count";
}

interface CategoriesRepresentedCriteria extends BaseCriteria {
  type: "categories_represented";
}

type BadgeCriteria =
  | ObjectByTypeCriteria
  | ObjectByConditionCriteria
  | ObjectWithPhotosCountCriteria
  | ObjectWithIsbnCountCriteria
  | ObjectWithCautionCountCriteria
  | ObjectWithRentalCountCriteria
  | LoanAsOwnerCountCriteria
  | LoanAsBorrowerCountCriteria
  | LoanCountCriteria
  | ObjectCountCriteria
  | ReviewCountCriteria
  | AvgRatingCriteria
  | LoansWithinDaysCriteria
  | OnTimeReturnsCountCriteria
  | LateReturnsCountCriteria
  | ActiveLoansCountCriteria
  | ReturnedLoansCountCriteria
  | OverdueLoansCountCriteria
  | CollectionCountCriteria
  | PublicCollectionsCountCriteria
  | PrivateCollectionsCountCriteria
  | CollectionByTypeCriteria
  | ReviewsReceivedCountCriteria
  | ReviewsWithCommentCountCriteria
  | HighRatingReceivedCountCriteria
  | PerfectRatingCountCriteria
  | ReviewsGivenWithCommentCriteria
  | ReviewsGivenCountCriteria
  | ContactCountCriteria
  | ContactWithBorrowerCountCriteria
  | ContactAddedThisMonthCriteria
  | ContactMessageSentCountCriteria
  | MessagesSentCountCriteria
  | UnreadMessagesCountCriteria
  | CommunityRequestsCountCriteria
  | RequestsFulfilledCountCriteria
  | RequestsFulfilledByCountCriteria
  | RequestMessagesCountCriteria
  | QrGeneratedCountCriteria
  | QrUsedCountCriteria
  | TierUpgradesCountCriteria
  | ProfileCompletePercentCriteria
  | HasAvatarCriteria
  | HasBioCriteria
  | MemberSinceDaysCriteria
  | LoansThisMonthCriteria
  | ObjectsAddedThisMonthCriteria
  | ReviewsThisMonthCriteria
  | LoanStreakCriteria
  | BorrowingStreakCriteria
  | ReturnedCountCriteria
  | HasAllObjectTypesCriteria
  | BorrowedFromCountCriteria
  | LentToCountCriteria
  | CategoriesRepresentedCriteria
  | ObjectMaxByFieldCriteria
  | ObjectByGenreValueCriteria
  | ObjectByEditionMatchCriteria;

interface BadgeStats {
  loanCount: number;
  objectCount: number;
  reviewCount: number;
  avgRating: number;
  loanAsOwnerCount: number;
  loanAsBorrowerCount: number;
  activeLoansCount: number;
  returnedLoansCount: number;
  overdueLoansCount: number;
  onTimeReturnsCount: number;
  lateReturnsCountCount: number;
  collectionCount: number;
  publicCollectionsCount: number;
  privateCollectionsCount: number;
  objectByType: Record<string, number>;
  objectByCondition: Record<string, number>;
  objectWithPhotosCount: number;
  objectWithIsbnCount: number;
  objectWithCautionCount: number;
  objectWithRentalCount: number;
  reviewsReceivedCount: number;
  reviewsWithCommentCount: number;
  highRatingReceivedCount: number;
  perfectRatingCount: number;
  reviewsGivenWithComment: number;
  contactCount: number;
  contactWithBorrowerCount: number;
  contactAddedThisMonth: number;
  messagesSentCount: number;
  unreadMessagesCount: number;
  communityRequestsCount: number;
  requestsFulfilledCount: number;
  requestsFulfilledByCount: number;
  qrGeneratedCount: number;
  qrUsedCount: number;
  memberSinceDays: number;
  loansThisMonth: number;
  objectsAddedThisMonth: number;
  reviewsThisMonth: number;
  loanStreak: number;
  borrowingStreak: number;
  returnedCount: number;
  hasAllObjectTypes: boolean;
  borrowedFromCount: number;
  lentToCount: number;
  categoriesRepresented: number;
  objectWithPhotosByType: Record<string, number>;
  objectWithIsbnByType: Record<string, number>;
  objectByTypeWithPhotos: Record<string, number>;
  // type → { valueLower → count } pour genre / série / édition (plateforme)
  objectGenreCountsByType: Record<string, Record<string, number>>;
  objectSeriesCountsByType: Record<string, Record<string, number>>;
  objectEditionCountsByType: Record<string, Record<string, number>>;
  // type → taille du plus gros groupe partageant la même valeur
  objectMaxSameGenreByType: Record<string, number>;
  objectMaxSameSeriesByType: Record<string, number>;
  // prêts empruntés sur les 30 derniers jours (fenêtre glissante)
  recentBorrowedLoans: Array<{ createdAt: Date; objectType: string | null }>;
  // prêts par type d'objet (propriétaire / emprunteur)
  loansAsOwnerByType: Record<string, number>;
  loansAsBorrowerByType: Record<string, number>;
}

// ===========================================
// STATS CACHE (60s TTL)
// ===========================================

const statsCache = new Map<string, { stats: BadgeStats; expiresAt: number }>();
const STATS_TTL_MS = 60_000;

function getCachedStats(userId: string): BadgeStats | null {
  const cached = statsCache.get(userId);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    statsCache.delete(userId);
    return null;
  }
  return cached.stats;
}

function setCachedStats(userId: string, stats: BadgeStats): void {
  statsCache.set(userId, {
    stats,
    expiresAt: Date.now() + STATS_TTL_MS,
  });
}

export function invalidateStatsCache(userId: string): void {
  statsCache.delete(userId);
}

// ===========================================
// FETCH USER STATS (parallel)
// ===========================================

async function fetchUserStats(prisma: PrismaClient, userId: string): Promise<BadgeStats> {
  const cached = getCachedStats(userId);
  if (cached) return cached;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    loanCount,
    objectCount,
    reviewCount,
    avgRatingResult,
    loanAsOwnerCount,
    loanAsBorrowerCount,
    activeLoansCount,
    returnedLoansCount,
    overdueLoansCount,
    onTimeReturnsCount,
    lateReturnsCountResult,
    collectionCount,
    publicCollectionsCount,
    privateCollectionsCount,
    reviewsReceivedCount,
    reviewsWithCommentCount,
    highRatingReceivedCount,
    perfectRatingCount,
    reviewsGivenWithComment,
    contactCount,
    contactWithBorrowerCount,
    contactAddedThisMonth,
    messagesSentCount,
    unreadMessagesCount,
    communityRequestsCount,
    requestsFulfilledCount,
    requestsFulfilledByCount,
    qrGeneratedCount,
    qrUsedCount,
    memberCreatedAt,
    loansThisMonth,
    objectsAddedThisMonth,
    reviewsThisMonth,
    requestsFulfilledByResult,
  ] = await Promise.all([
    prisma.loan.count({ where: { OR: [{ ownerId: userId }, { borrowerId: userId }] } }),
    prisma.object.count({ where: { collection: { userId } } }),
    prisma.review.count({ where: { authorId: userId } }),
    prisma.review.aggregate({ where: { targetId: userId }, _avg: { rating: true } }),
    prisma.loan.count({ where: { ownerId: userId } }),
    prisma.loan.count({ where: { borrowerId: userId } }),
    prisma.loan.count({ where: { OR: [{ ownerId: userId }, { borrowerId: userId }], status: { in: ["ACTIVE", "OVERDUE"] } } }),
    prisma.loan.count({ where: { OR: [{ ownerId: userId }, { borrowerId: userId }], status: "RETURNED" } }),
    prisma.loan.count({ where: { OR: [{ ownerId: userId }, { borrowerId: userId }], status: "OVERDUE" } }),
    prisma.loan.count({ where: { OR: [{ ownerId: userId }, { borrowerId: userId }], status: "RETURNED", returnedAt: { not: null } } }),
    prisma.loan.count({ where: { OR: [{ ownerId: userId }, { borrowerId: userId }], status: "RETURNED", returnedAt: { not: null } } }),
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isPublic: true } }),
    prisma.collection.count({ where: { userId, isPublic: false } }),
    prisma.review.count({ where: { targetId: userId } }),
    prisma.review.count({ where: { targetId: userId, comment: { not: null } } }),
    prisma.review.count({ where: { targetId: userId, rating: { gte: 4 } } }),
    prisma.review.count({ where: { targetId: userId, rating: 5 } }),
    prisma.review.count({ where: { authorId: userId, comment: { not: null } } }),
    prisma.contact.count({ where: { userId } }),
    prisma.contact.count({ where: { userId, borrowerId: { not: null } } }),
    prisma.contact.count({ where: { userId, createdAt: { gte: startOfMonth } } }),
    // "Messages envoyés" = RequestMessage dont l'utilisateur est l'auteur
    // (les Message QR ont ownerId = destinataire, pas l'expéditeur).
    prisma.requestMessage.count({ where: { fromUserId: userId } }),
    prisma.message.count({ where: { ownerId: userId, read: false } }),
    prisma.communityRequest.count({ where: { authorId: userId } }),
    prisma.communityRequest.count({ where: { authorId: userId, status: "FULFILLED" } }),
    prisma.communityRequest.count({ where: { fulfillBy: { authorId: userId } } }),
    prisma.qrStock.count({ where: { userId } }),
    prisma.qrStock.count({ where: { userId, used: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    prisma.loan.count({ where: { OR: [{ ownerId: userId }, { borrowerId: userId }], createdAt: { gte: startOfMonth } } }),
    prisma.object.count({ where: { collection: { userId }, createdAt: { gte: startOfMonth } } }),
    prisma.review.count({ where: { authorId: userId, createdAt: { gte: startOfMonth } } }),
    // Retours en retard : returnedAt > returnDueDate (comparaison de colonnes
    // impossible en Prisma count → raw SQL).
    prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "loans" WHERE ("ownerId" = ${userId} OR "borrowerId" = ${userId}) AND "status" = 'RETURNED' AND "returnedAt" IS NOT NULL AND "returnDueDate" IS NOT NULL AND "returnedAt" > "returnDueDate"`,
  ]);

  const memberSinceDays = memberCreatedAt?.createdAt
    ? Math.floor((now.getTime() - memberCreatedAt.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const objectByType: Record<string, number> = {};
  const objectTypes: ObjectType[] = ["BOOK", "BOARD_GAME", "TOOL", "FILM", "MUSIC", "ELECTRONIC", "ELECTRIC", "CLOTHING", "CUSTOM", "VIDEOGAME"];
  const objectByTypePromises = objectTypes.map((t) =>
    prisma.object.count({ where: { collection: { userId }, objectType: t } }).then((count) => {
      if (count > 0) objectByType[t] = count;
    })
  );
  await Promise.all(objectByTypePromises);

  const objectByCondition: Record<string, number> = {};
  const conditions = ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"];
  const conditionPromises = conditions.map((c) =>
    prisma.object.count({ where: { collection: { userId }, condition: c as any } }).then((count) => {
      if (count > 0) objectByCondition[c] = count;
    })
  );
  await Promise.all(conditionPromises);

  const [objectWithPhotosCount, objectWithIsbnCount, objectWithCautionCount, objectWithRentalCount, objectWithPhotosByTypeResult, objectWithIsbnByTypeResult] = await Promise.all([
    prisma.object.count({ where: { collection: { userId }, photos: { some: {} } } }),
    prisma.object.count({ where: { collection: { userId }, isbn: { not: null } } }),
    prisma.object.count({ where: { collection: { userId }, cautionAmount: { not: null } } }),
    prisma.object.count({ where: { collection: { userId }, rentalPriceDay: { not: null } } }),
    prisma.object.groupBy({
      by: ["objectType"],
      where: { collection: { userId }, photos: { some: {} } },
      _count: { _all: true },
    }),
    prisma.object.groupBy({
      by: ["objectType"],
      where: { collection: { userId }, isbn: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const objectWithPhotosByType: Record<string, number> = {};
  for (const row of objectWithPhotosByTypeResult) {
    if (row.objectType) objectWithPhotosByType[row.objectType] = row._count._all;
  }

  const objectWithIsbnByType: Record<string, number> = {};
  for (const row of objectWithIsbnByTypeResult) {
    if (row.objectType) objectWithIsbnByType[row.objectType] = row._count._all;
  }

  const hasAllObjectTypes = objectTypes.every((t) => (objectByType[t] ?? 0) > 0);

  const [borrowedFromResult, lentToResult] = await Promise.all([
    prisma.loan.findMany({
      where: { borrowerId: userId },
      select: { ownerId: true },
      distinct: ["ownerId"],
    }),
    prisma.loan.findMany({
      where: { ownerId: userId, borrowerId: { not: null } },
      select: { borrowerId: true },
      distinct: ["borrowerId"],
    }),
  ]);

  const borrowedFromCount = borrowedFromResult.length;
  const lentToCount = lentToResult.length;

  const objectByTypeWithPhotos: Record<string, number> = {};
  for (const row of objectWithPhotosByTypeResult) {
    if (row.objectType) objectByTypeWithPhotos[row.objectType] = row._count._all;
  }

  // Retours en retard (returnedAt > returnDueDate) — raw SQL, déjà calculé
  // ci-dessus. Les "à temps" en sont le complément des retours effectués.
  const lateReturnsCount = Array.isArray(requestsFulfilledByResult)
    ? ((requestsFulfilledByResult as Array<{ count: number }>)[0]?.count ?? 0)
    : 0;
  const onTimeReturnsRealCount = Math.max(0, returnedLoansCount - lateReturnsCount);

  // Genre / série / édition groupés par type d'objet — alimente les badges
  // "N d'un même genre/série", "N d'un genre précis", "plateforme jeu".
  const [genreGroups, seriesGroups, editionGroups, recentBorrowed, ownerLoanTypes, borrowerLoanTypes] = await Promise.all([
    prisma.object.groupBy({
      by: ["objectType", "genre"],
      where: { collection: { userId }, genre: { not: null } },
      _count: { _all: true },
    }),
    prisma.object.groupBy({
      by: ["objectType", "series"],
      where: { collection: { userId }, series: { not: null } },
      _count: { _all: true },
    }),
    prisma.object.groupBy({
      by: ["objectType", "edition"],
      where: { collection: { userId }, edition: { not: null } },
      _count: { _all: true },
    }),
    prisma.loan.findMany({
      where: { borrowerId: userId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, object: { select: { objectType: true } } },
    }),
    // Prêts par type d'objet (côté propriétaire / emprunteur) — pour les badges
    // "N <type> prêtés/empruntés" qui sinon comptaient tous types confondus.
    prisma.loan.findMany({
      where: { ownerId: userId },
      select: { object: { select: { objectType: true } } },
    }),
    prisma.loan.findMany({
      where: { borrowerId: userId },
      select: { object: { select: { objectType: true } } },
    }),
  ]);

  const tallyByType = (rows: Array<{ object: { objectType: string | null } | null }>) => {
    const m: Record<string, number> = {};
    for (const r of rows) {
      const t = r.object?.objectType;
      if (t) m[t] = (m[t] ?? 0) + 1;
    }
    return m;
  };
  const loansAsOwnerByType = tallyByType(ownerLoanTypes as never);
  const loansAsBorrowerByType = tallyByType(borrowerLoanTypes as never);

  // type → { valueLower → count }
  const objectGenreCountsByType: Record<string, Record<string, number>> = {};
  const objectSeriesCountsByType: Record<string, Record<string, number>> = {};
  const objectEditionCountsByType: Record<string, Record<string, number>> = {};
  const fillMap = (
    rows: Array<{ objectType: string | null; _count: { _all: number } }>,
    key: "genre" | "series" | "edition",
    target: Record<string, Record<string, number>>,
  ) => {
    for (const row of rows) {
      const t = row.objectType ?? "";
      const value = (row as Record<string, unknown>)[key] as string | null;
      if (!t || !value) continue;
      // Somme (et non écrasement) : deux casses différentes ("Manga"/"manga")
      // groupées séparément par SQL retombent sur la même clé normalisée.
      const k = value.toLowerCase();
      const bucket = (target[t] ??= {});
      bucket[k] = (bucket[k] ?? 0) + row._count._all;
    }
  };
  fillMap(genreGroups as never, "genre", objectGenreCountsByType);
  fillMap(seriesGroups as never, "series", objectSeriesCountsByType);
  fillMap(editionGroups as never, "edition", objectEditionCountsByType);

  // Plus gros groupe (même valeur) par type, pour "N d'un même genre/série".
  const maxOf = (m: Record<string, number> | undefined) =>
    m ? Math.max(0, ...Object.values(m)) : 0;
  const objectMaxSameGenreByType: Record<string, number> = {};
  const objectMaxSameSeriesByType: Record<string, number> = {};
  for (const t of Object.keys(objectGenreCountsByType)) {
    objectMaxSameGenreByType[t] = maxOf(objectGenreCountsByType[t]);
  }
  for (const t of Object.keys(objectSeriesCountsByType)) {
    objectMaxSameSeriesByType[t] = maxOf(objectSeriesCountsByType[t]);
  }

  const recentBorrowedLoans = recentBorrowed.map((l) => ({
    createdAt: l.createdAt,
    objectType: l.object?.objectType ?? null,
  }));

  const loanStreak = await calculateLoanStreak(prisma, userId);
  const borrowingStreak = await calculateBorrowingStreak(prisma, userId);

  const stats: BadgeStats = {
    loanCount,
    objectCount,
    reviewCount,
    avgRating: avgRatingResult._avg.rating ?? 0,
    loanAsOwnerCount,
    loanAsBorrowerCount,
    activeLoansCount,
    returnedLoansCount,
    overdueLoansCount,
    onTimeReturnsCount: onTimeReturnsRealCount,
    lateReturnsCountCount: lateReturnsCount,
    collectionCount,
    publicCollectionsCount,
    privateCollectionsCount,
    objectByType,
    objectByCondition,
    objectWithPhotosCount,
    objectWithIsbnCount,
    objectWithCautionCount,
    objectWithRentalCount,
    reviewsReceivedCount,
    reviewsWithCommentCount,
    highRatingReceivedCount,
    perfectRatingCount,
    reviewsGivenWithComment,
    contactCount,
    contactWithBorrowerCount,
    contactAddedThisMonth,
    messagesSentCount,
    unreadMessagesCount,
    communityRequestsCount,
    requestsFulfilledCount,
    requestsFulfilledByCount: requestsFulfilledByCount ?? 0,
    qrGeneratedCount,
    qrUsedCount,
    memberSinceDays,
    loansThisMonth,
    objectsAddedThisMonth,
    reviewsThisMonth,
    loanStreak,
    borrowingStreak,
    returnedCount: returnedLoansCount,
    hasAllObjectTypes,
    borrowedFromCount,
    lentToCount,
    categoriesRepresented: Object.keys(objectByType).length,
    objectWithPhotosByType,
    objectWithIsbnByType,
    objectByTypeWithPhotos,
    objectGenreCountsByType,
    objectSeriesCountsByType,
    objectEditionCountsByType,
    objectMaxSameGenreByType,
    objectMaxSameSeriesByType,
    recentBorrowedLoans,
    loansAsOwnerByType,
    loansAsBorrowerByType,
  };

  setCachedStats(userId, stats);
  return stats;
}

async function calculateLoanStreak(prisma: PrismaClient, userId: string): Promise<number> {
  const loans = await prisma.loan.findMany({
    where: { OR: [{ ownerId: userId }, { borrowerId: userId }] },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (loans.length === 0) return 0;

  const months = new Set<string>();
  for (const loan of loans) {
    const d = loan.createdAt;
    months.add(`${d.getFullYear()}-${d.getMonth()}`);
  }

  const sortedMonths = Array.from(months).sort().reverse();
  let streak = 1;

  for (let i = 1; i < sortedMonths.length; i++) {
    const parts = sortedMonths[i - 1]!.split("-");
    const prevParts = sortedMonths[i]!.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const prevYear = Number(prevParts[0]);
    const prevMonth = Number(prevParts[1]);

    // Écart en nombre de mois calendaires (et non en jours : un mois de 31
    // jours / 30 cassait à tort le streak).
    const monthsApart = (year * 12 + month) - (prevYear * 12 + prevMonth);
    if (monthsApart === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

async function calculateBorrowingStreak(prisma: PrismaClient, userId: string): Promise<number> {
  const loans = await prisma.loan.findMany({
    where: { borrowerId: userId },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (loans.length === 0) return 0;

  const months = new Set<string>();
  for (const loan of loans) {
    const d = loan.createdAt;
    months.add(`${d.getFullYear()}-${d.getMonth()}`);
  }

  const sortedMonths = Array.from(months).sort().reverse();
  let streak = 1;

  for (let i = 1; i < sortedMonths.length; i++) {
    const parts = sortedMonths[i - 1]!.split("-");
    const prevParts = sortedMonths[i]!.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const prevYear = Number(prevParts[0]);
    const prevMonth = Number(prevParts[1]);

    // Écart en nombre de mois calendaires (et non en jours : un mois de 31
    // jours / 30 cassait à tort le streak).
    const monthsApart = (year * 12 + month) - (prevYear * 12 + prevMonth);
    if (monthsApart === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ===========================================
// CRITERIA HANDLERS (strategy pattern)
// ===========================================

type CriteriaHandler = (stats: BadgeStats, criteria: BadgeCriteria) => boolean;

const criteriaHandlers: Record<string, CriteriaHandler> = {
  loan_count: (stats, criteria) => {
    const threshold = (criteria as LoanCountCriteria).threshold ?? 1;
    return compare(stats.loanCount, threshold, (criteria as LoanCountCriteria).operator);
  },

  object_count: (stats, criteria) => {
    const threshold = (criteria as ObjectCountCriteria).threshold ?? 1;
    return compare(stats.objectCount, threshold, (criteria as ObjectCountCriteria).operator);
  },

  review_count: (stats, criteria) => {
    const threshold = (criteria as ReviewCountCriteria).threshold ?? 1;
    return compare(stats.reviewCount, threshold, (criteria as ReviewCountCriteria).operator);
  },

  avg_rating: (stats, criteria) => {
    const threshold = (criteria as AvgRatingCriteria).threshold ?? 1;
    return compare(stats.avgRating, threshold, (criteria as AvgRatingCriteria).operator);
  },

  object_by_type: (stats, criteria) => {
    const c = criteria as ObjectByTypeCriteria;
    const objectType = c.params?.objectType as string;
    const count = stats.objectByType[objectType] ?? 0;
    return compare(count, c.threshold ?? 1, c.operator);
  },

  object_by_condition: (stats, criteria) => {
    const c = criteria as ObjectByConditionCriteria;
    const condition = c.params?.condition as string;
    const count = stats.objectByCondition[condition] ?? 0;
    return compare(count, c.threshold ?? 1, c.operator);
  },

  object_with_photos_count: (stats, criteria) => {
    const c = criteria as ObjectWithPhotosCountCriteria;
    const objectType = c.params?.objectType as string | undefined;
    if (objectType) {
      const count = stats.objectWithPhotosByType[objectType] ?? 0;
      return compare(count, c.threshold ?? 1, c.operator);
    }
    return compare(stats.objectWithPhotosCount, c.threshold ?? 1, c.operator);
  },

  object_with_isbn_count: (stats, criteria) => {
    const c = criteria as ObjectWithIsbnCountCriteria;
    const objectType = c.params?.objectType as string | undefined;
    if (objectType) {
      const count = stats.objectWithIsbnByType[objectType] ?? 0;
      return compare(count, c.threshold ?? 1, c.operator);
    }
    return compare(stats.objectWithIsbnCount, c.threshold ?? 1, c.operator);
  },

  object_with_caution_count: (stats, criteria) => {
    const c = criteria as ObjectWithCautionCountCriteria;
    return compare(stats.objectWithCautionCount, c.threshold ?? 1, c.operator);
  },

  object_with_rental_count: (stats, criteria) => {
    const c = criteria as ObjectWithRentalCountCriteria;
    return compare(stats.objectWithRentalCount, c.threshold ?? 1, c.operator);
  },

  loan_as_owner_count: (stats, criteria) => {
    const c = criteria as LoanAsOwnerCountCriteria;
    const t = c.params?.objectType as string | undefined;
    const value = t ? stats.loansAsOwnerByType[t] ?? 0 : stats.loanAsOwnerCount;
    return compare(value, c.threshold ?? 1, c.operator);
  },

  loan_as_borrower_count: (stats, criteria) => {
    const c = criteria as LoanAsBorrowerCountCriteria;
    const t = c.params?.objectType as string | undefined;
    const value = t ? stats.loansAsBorrowerByType[t] ?? 0 : stats.loanAsBorrowerCount;
    return compare(value, c.threshold ?? 1, c.operator);
  },

  active_loans_count: (stats, criteria) => {
    const c = criteria as ActiveLoansCountCriteria;
    return compare(stats.activeLoansCount, c.threshold ?? 1, c.operator);
  },

  returned_loans_count: (stats, criteria) => {
    const c = criteria as ReturnedLoansCountCriteria;
    return compare(stats.returnedLoansCount, c.threshold ?? 1, c.operator);
  },

  overdue_loans_count: (stats, criteria) => {
    const c = criteria as OverdueLoansCountCriteria;
    return compare(stats.overdueLoansCount, c.threshold ?? 1, c.operator);
  },

  loans_within_days: (stats, criteria) => {
    const c = criteria as LoansWithinDaysCriteria;
    const days = c.params?.days ?? 30;
    const objectType = c.params?.objectType as string | undefined;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const count = stats.recentBorrowedLoans.filter(
      (l) =>
        l.createdAt.getTime() >= cutoff &&
        (!objectType || l.objectType === objectType),
    ).length;
    return compare(count, c.threshold ?? 1, c.operator);
  },

  object_max_by_field: (stats, criteria) => {
    const c = criteria as ObjectMaxByFieldCriteria;
    const t = c.params?.objectType as string;
    const max =
      c.params?.field === "series"
        ? stats.objectMaxSameSeriesByType[t] ?? 0
        : stats.objectMaxSameGenreByType[t] ?? 0;
    return compare(max, c.threshold ?? 1, c.operator);
  },

  object_by_genre_value: (stats, criteria) => {
    const c = criteria as ObjectByGenreValueCriteria;
    const t = c.params?.objectType as string;
    const value = (c.params?.value ?? "").toLowerCase();
    const count = stats.objectGenreCountsByType[t]?.[value] ?? 0;
    return compare(count, c.threshold ?? 1, c.operator);
  },

  object_by_edition_match: (stats, criteria) => {
    const c = criteria as ObjectByEditionMatchCriteria;
    const t = c.params?.objectType as string;
    const needle = (c.params?.contains ?? "").toLowerCase();
    const map = stats.objectEditionCountsByType[t] ?? {};
    let count = 0;
    for (const [k, v] of Object.entries(map)) {
      if (k.includes(needle)) count += v;
    }
    return compare(count, c.threshold ?? 1, c.operator);
  },

  on_time_returns_count: (stats, criteria) => {
    const c = criteria as OnTimeReturnsCountCriteria;
    return compare(stats.onTimeReturnsCount, c.threshold ?? 1, c.operator);
  },

  late_returns_count: (stats, criteria) => {
    const c = criteria as LateReturnsCountCriteria;
    return compare(stats.lateReturnsCountCount, c.threshold ?? 1, c.operator);
  },

  collection_count: (stats, criteria) => {
    const c = criteria as CollectionCountCriteria;
    return compare(stats.collectionCount, c.threshold ?? 1, c.operator);
  },

  public_collections_count: (stats, criteria) => {
    const c = criteria as PublicCollectionsCountCriteria;
    return compare(stats.publicCollectionsCount, c.threshold ?? 1, c.operator);
  },

  private_collections_count: (stats, criteria) => {
    const c = criteria as PrivateCollectionsCountCriteria;
    return compare(stats.privateCollectionsCount, c.threshold ?? 1, c.operator);
  },

  collection_by_type: (stats, criteria) => {
    const c = criteria as CollectionByTypeCriteria;
    const objectType = c.params?.objectType as string;
    const count = stats.objectByType[objectType] ?? 0;
    return compare(count, c.threshold ?? 1, c.operator);
  },

  reviews_received_count: (stats, criteria) => {
    const c = criteria as ReviewsReceivedCountCriteria;
    return compare(stats.reviewsReceivedCount, c.threshold ?? 1, c.operator);
  },

  reviews_with_comment_count: (stats, criteria) => {
    const c = criteria as ReviewsWithCommentCountCriteria;
    return compare(stats.reviewsWithCommentCount, c.threshold ?? 1, c.operator);
  },

  high_rating_received_count: (stats, criteria) => {
    const c = criteria as HighRatingReceivedCountCriteria;
    return compare(stats.highRatingReceivedCount, c.threshold ?? 1, c.operator);
  },

  perfect_rating_count: (stats, criteria) => {
    const c = criteria as PerfectRatingCountCriteria;
    return compare(stats.perfectRatingCount, c.threshold ?? 1, c.operator);
  },

  reviews_given_with_comment: (stats, criteria) => {
    const c = criteria as ReviewsGivenWithCommentCriteria;
    return compare(stats.reviewsGivenWithComment, c.threshold ?? 1, c.operator);
  },

  reviews_given_count: (stats, criteria) => {
    const c = criteria as ReviewsGivenCountCriteria;
    return compare(stats.reviewCount, c.threshold ?? 1, c.operator);
  },

  contact_count: (stats, criteria) => {
    const c = criteria as ContactCountCriteria;
    return compare(stats.contactCount, c.threshold ?? 1, c.operator);
  },

  contact_with_borrower_count: (stats, criteria) => {
    const c = criteria as ContactWithBorrowerCountCriteria;
    return compare(stats.contactWithBorrowerCount, c.threshold ?? 1, c.operator);
  },

  contact_added_this_month: (stats, criteria) => {
    const c = criteria as ContactAddedThisMonthCriteria;
    return compare(stats.contactAddedThisMonth, c.threshold ?? 1, c.operator);
  },

  contact_message_sent_count: (stats, criteria) => {
    const c = criteria as ContactMessageSentCountCriteria;
    return compare(stats.messagesSentCount, c.threshold ?? 1, c.operator);
  },

  messages_sent_count: (stats, criteria) => {
    const c = criteria as MessagesSentCountCriteria;
    return compare(stats.messagesSentCount, c.threshold ?? 1, c.operator);
  },

  unread_messages_count: (stats, criteria) => {
    const c = criteria as UnreadMessagesCountCriteria;
    return compare(stats.unreadMessagesCount, c.threshold ?? 1, c.operator);
  },

  community_requests_count: (stats, criteria) => {
    const c = criteria as CommunityRequestsCountCriteria;
    return compare(stats.communityRequestsCount, c.threshold ?? 1, c.operator);
  },

  requests_fulfilled_count: (stats, criteria) => {
    const c = criteria as RequestsFulfilledCountCriteria;
    return compare(stats.requestsFulfilledCount, c.threshold ?? 1, c.operator);
  },

  requests_fulfilled_by_count: (stats, criteria) => {
    const c = criteria as RequestsFulfilledByCountCriteria;
    return compare(stats.requestsFulfilledByCount, c.threshold ?? 1, c.operator);
  },

  request_messages_count: (stats, criteria) => {
    const c = criteria as RequestMessagesCountCriteria;
    return compare(stats.communityRequestsCount, c.threshold ?? 1, c.operator);
  },

  qr_generated_count: (stats, criteria) => {
    const c = criteria as QrGeneratedCountCriteria;
    return compare(stats.qrGeneratedCount, c.threshold ?? 1, c.operator);
  },

  qr_used_count: (stats, criteria) => {
    const c = criteria as QrUsedCountCriteria;
    return compare(stats.qrUsedCount, c.threshold ?? 1, c.operator);
  },

  tier_upgrades_count: (stats, criteria) => {
    const c = criteria as TierUpgradesCountCriteria;
    return compare(0, c.threshold ?? 1, c.operator);
  },

  profile_complete_percent: (stats, criteria) => {
    const c = criteria as ProfileCompletePercentCriteria;
    return compare(0, c.threshold ?? 1, c.operator);
  },

  has_avatar: (stats, criteria) => {
    const c = criteria as HasAvatarCriteria;
    return compare(0, c.threshold ?? 1, c.operator);
  },

  has_bio: (stats, criteria) => {
    const c = criteria as HasBioCriteria;
    return compare(0, c.threshold ?? 1, c.operator);
  },

  member_since_days: (stats, criteria) => {
    const c = criteria as MemberSinceDaysCriteria;
    return compare(stats.memberSinceDays, c.threshold ?? 0, c.operator ?? ">=");
  },

  loans_this_month: (stats, criteria) => {
    const c = criteria as LoansThisMonthCriteria;
    return compare(stats.loansThisMonth, c.threshold ?? 1, c.operator);
  },

  objects_added_this_month: (stats, criteria) => {
    const c = criteria as ObjectsAddedThisMonthCriteria;
    return compare(stats.objectsAddedThisMonth, c.threshold ?? 1, c.operator);
  },

  reviews_this_month: (stats, criteria) => {
    const c = criteria as ReviewsThisMonthCriteria;
    return compare(stats.reviewsThisMonth, c.threshold ?? 1, c.operator);
  },

  loan_streak: (stats, criteria) => {
    const c = criteria as LoanStreakCriteria;
    return compare(stats.loanStreak, c.threshold ?? 1, c.operator);
  },

  borrowing_streak: (stats, criteria) => {
    const c = criteria as BorrowingStreakCriteria;
    return compare(stats.borrowingStreak, c.threshold ?? 1, c.operator);
  },

  returned_count: (stats, criteria) => {
    const c = criteria as ReturnedCountCriteria;
    return compare(stats.returnedCount, c.threshold ?? 1, c.operator);
  },

  has_all_object_types: (stats, criteria) => {
    const c = criteria as HasAllObjectTypesCriteria;
    return stats.hasAllObjectTypes;
  },

  borrowed_from_count: (stats, criteria) => {
    const c = criteria as BorrowedFromCountCriteria;
    return compare(stats.borrowedFromCount, c.threshold ?? 1, c.operator);
  },

  lent_to_count: (stats, criteria) => {
    const c = criteria as LentToCountCriteria;
    return compare(stats.lentToCount, c.threshold ?? 1, c.operator);
  },

  categories_represented: (stats, criteria) => {
    const c = criteria as CategoriesRepresentedCriteria;
    return compare(stats.categoriesRepresented, c.threshold ?? 1, c.operator);
  },
};

function compare(value: number, threshold: number, operator?: CriteriaOperator): boolean {
  switch (operator) {
    case "==":
      return value === threshold;
    case ">":
      return value > threshold;
    case "<":
      return value < threshold;
    case "<=":
      return value <= threshold;
    case "!=":
      return value !== threshold;
    case "first":
      return value >= threshold;
    case "streak":
      return value >= threshold;
    default:
      return value >= threshold;
  }
}

// ===========================================
// SYNC USER BADGES
// ===========================================

export async function syncUserBadges(prisma: PrismaClient, userId: string): Promise<string[]> {
  const stats = await fetchUserStats(prisma, userId);
  const definitions = await prisma.badgeDefinition.findMany();
  const awarded: string[] = [];

  for (const def of definitions) {
    const criteria = def.criteria as unknown as BadgeCriteria;
    const handler = criteriaHandlers[criteria.type];

    if (!handler) continue;

    const earned = handler(stats, criteria);
if (earned) {
        try {
          await prisma.userBadge.create({
            data: { userId, badgeId: def.id },
          });
          await prisma.notification.create({
            data: {
              userId,
              type: "BADGE_UNLOCKED",
              title: "Badge débloqué !",
              message: `Félicitations ! Vous avez obtenu le badge "${def.name}"`,
              relatedId: def.id,
              relatedType: "badge",
            },
          });
          awarded.push(def.slug);
        } catch {
          // Déjà présent — ignore
        }
      }
  }

  return awarded;
}