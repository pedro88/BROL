-- CreateEnum
CREATE TYPE "SelfServiceMode" AS ENUM ('OFF', 'CONTACTS', 'RADIUS', 'PUBLIC');

-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "selfServiceMode" "SelfServiceMode" NOT NULL DEFAULT 'OFF';

-- AlterTable
ALTER TABLE "objects" ADD COLUMN     "selfServiceMode" "SelfServiceMode" NOT NULL DEFAULT 'OFF';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "maxSelfBorrowPerWeek" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "selfServiceRadiusKm" INTEGER;
