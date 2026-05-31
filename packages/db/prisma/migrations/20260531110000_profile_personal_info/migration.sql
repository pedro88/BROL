-- AlterTable: enrichissement Profile (champs perso + toggles de visibilité publique)
ALTER TABLE "profiles"
  ADD COLUMN "birthYear"       INTEGER,
  ADD COLUMN "gender"          TEXT,
  ADD COLUMN "phone"           TEXT,
  ADD COLUMN "publicEmail"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publicPhone"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publicBirthYear" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publicGender"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publicCity"      BOOLEAN NOT NULL DEFAULT true;
