/**
 * Seed script for Brol database.
 * @package @brol/db
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Badge definitions à créer par défaut */
const BADGE_DEFINITIONS = [
  {
    slug: "first-loan",
    name: "Premier prêt",
    description: "Vous avez effectué votre premier prêt.",
    icon: "🎉",
    criteria: { type: "loan_count", threshold: 1 },
  },
  {
    slug: "lender-5",
    name: "Prêteur confirmé",
    description: "Vous avez réalisé 5 prêts.",
    icon: "⭐",
    criteria: { type: "loan_count", threshold: 5 },
  },
  {
    slug: "lender-25",
    name: "Prêteur expert",
    description: "Vous avez réalisé 25 prêts.",
    icon: "🌟",
    criteria: { type: "loan_count", threshold: 25 },
  },
  {
    slug: "collector-10",
    name: "Collectionneur",
    description: "Vous avez ajouté 10 objets à vos collections.",
    icon: "📚",
    criteria: { type: "object_count", threshold: 10 },
  },
  {
    slug: "collector-50",
    name: "Grand collectionneur",
    description: "Vous avez ajouté 50 objets à vos collections.",
    icon: "🏆",
    criteria: { type: "object_count", threshold: 50 },
  },
  {
    slug: "reviewer",
    name: "Critique",
    description: "Vous avez laissé un avis sur un autre utilisateur.",
    icon: "💬",
    criteria: { type: "review_count", threshold: 1 },
  },
  {
    slug: "five-stars",
    name: "Cinq étoiles",
    description: "Vous avez reçu une note moyenne de 5 étoiles.",
    icon: "💎",
    criteria: { type: "avg_rating", threshold: 5 },
  },
];

async function main() {
  console.log("🌱 Seeding badge definitions...");

  for (const badge of BADGE_DEFINITIONS) {
    await prisma.badgeDefinition.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    });
    console.log(`  ✓ ${badge.name}`);
  }

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
