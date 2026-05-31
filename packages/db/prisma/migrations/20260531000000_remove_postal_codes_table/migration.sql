-- Drop postal_codes table : la stratégie a pivoté de "seed statique
-- geonames" vers "appel API Zippopotam.us direct sans cache".
-- User.lat/lng reste cache sur User au save.
DROP TABLE IF EXISTS "postal_codes";
