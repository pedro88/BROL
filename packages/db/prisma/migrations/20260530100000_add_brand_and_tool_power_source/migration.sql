-- CreateEnum
CREATE TYPE "ToolPowerSource" AS ENUM ('MANUAL', 'MAINS', 'BATTERY');

-- AlterTable
ALTER TABLE "objects"
  ADD COLUMN "brand" TEXT,
  ADD COLUMN "toolPowerSource" "ToolPowerSource";

-- Backfill: dériver toolPowerSource depuis les anciens booléens
UPDATE "objects" SET "toolPowerSource" = 'MANUAL'  WHERE "toolPowerSource" IS NULL AND "toolManual"  = TRUE;
UPDATE "objects" SET "toolPowerSource" = 'BATTERY' WHERE "toolPowerSource" IS NULL AND "toolBattery" = TRUE;
-- Tous les TOOLs restants sans signal explicite : MAINS (alimentation secteur par défaut).
UPDATE "objects" SET "toolPowerSource" = 'MAINS'
  WHERE "toolPowerSource" IS NULL
    AND "objectType" = 'TOOL';
