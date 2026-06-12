-- AlterTable
ALTER TABLE "badge_definitions" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'MILESTONE',
ADD COLUMN     "rarity" TEXT NOT NULL DEFAULT 'COMMON',
ADD COLUMN     "svgAsset" TEXT,
ADD COLUMN     "unlockHint" TEXT;
