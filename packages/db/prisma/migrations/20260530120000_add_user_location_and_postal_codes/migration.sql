-- AlterTable: localisation User (soft gate post-signup ; nullable)
ALTER TABLE "users"
  ADD COLUMN "country"    TEXT,
  ADD COLUMN "postalCode" TEXT,
  ADD COLUMN "city"       TEXT,
  ADD COLUMN "lat"        DOUBLE PRECISION,
  ADD COLUMN "lng"        DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "users_country_postalCode_idx" ON "users"("country", "postalCode");

-- CreateTable: référentiel statique seedé depuis geonames.org
CREATE TABLE "postal_codes" (
    "country"    TEXT             NOT NULL,
    "postalCode" TEXT             NOT NULL,
    "city"       TEXT             NOT NULL,
    "lat"        DOUBLE PRECISION NOT NULL,
    "lng"        DOUBLE PRECISION NOT NULL,

    CONSTRAINT "postal_codes_pkey" PRIMARY KEY ("country", "postalCode")
);

-- CreateIndex
CREATE INDEX "postal_codes_country_idx" ON "postal_codes"("country");
