-- Backfill : pour les objets qui ont une ou plusieurs photos uploadées
-- mais dont `coverImage` est NULL (parce que `photos.add` ne syncait pas
-- la colonne avant le commit 0cd8646), on remonte l'URL de la photo de
-- plus petite position (puis plus ancienne en cas d'égalité) sur
-- `Object.coverImage`.
--
-- Idempotent : ne touche pas aux objets qui ont déjà une cover.
UPDATE "objects" o
SET "coverImage" = (
  SELECT p."url"
  FROM "photos" p
  WHERE p."objectId" = o."id"
  ORDER BY p."position" ASC, p."createdAt" ASC
  LIMIT 1
)
WHERE o."coverImage" IS NULL
  AND EXISTS (SELECT 1 FROM "photos" p WHERE p."objectId" = o."id");
