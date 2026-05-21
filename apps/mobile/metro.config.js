/**
 * Metro config — Expo + pnpm monorepo.
 *
 * Sans ce fichier, Metro prend la racine du monorepo comme serverRoot
 * et tente de résoudre `expo-router/entry` depuis `<repo>/node_modules`,
 * où pnpm n'a rien hoisté → 404 sur le bundle côté Expo Go.
 *
 * Doc officielle : https://docs.expo.dev/guides/monorepos/
 *
 * @package @brol/mobile
 */
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Surveiller toute la racine du monorepo (pour les packages workspace)
config.watchFolders = [monorepoRoot];

// 2. Forcer Metro à résoudre les modules d'abord dans apps/mobile/node_modules
//    puis dans la racine — indispensable avec pnpm (pas de hoisting).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 3. Désactiver la remontée hiérarchique : pnpm utilise des symlinks vers
//    `.pnpm/`, la résolution par défaut de Node casse sur des packages
//    fantômes (phantom deps). On n'autorise que les chemins listés ci-dessus.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
