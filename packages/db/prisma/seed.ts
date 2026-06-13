/**
 * Seed script for Brol database — upsert des définitions de badges.
 * Les définitions vivent dans `src/badge-definitions.ts` (réutilisées par les
 * tests). Ce script ne fait qu'écrire en base.
 * @package @brol/db
 */

import { PrismaClient } from "@prisma/client";
import { ALL_BADGE_DEFINITIONS, svgAssetFor } from "../src/badge-definitions";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding badge definitions...");

  const countMap: Record<string, number> = {};

  for (const badge of ALL_BADGE_DEFINITIONS) {
    const data = { ...badge, svgAsset: svgAssetFor(badge) };
    await prisma.badgeDefinition.upsert({
      where: { slug: badge.slug },
      update: data,
      create: data,
    });
    countMap[badge.category] = (countMap[badge.category] ?? 0) + 1;
    console.log(`  ✓ ${badge.name} (${badge.rarity})`);
  }

  console.log("\n📊 Badge counts by category:");
  for (const [cat, count] of Object.entries(countMap)) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log(`\n✅ Total: ${ALL_BADGE_DEFINITIONS.length} badges`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
