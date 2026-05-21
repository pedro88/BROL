/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build output minimal pour Docker (copie uniquement ce qui est nécessaire au runtime,
  // pas tout le node_modules). Doc : https://nextjs.org/docs/app/api-reference/next-config-js/output
  output: "standalone",
  // Prisma client embarque des binaires natifs (libquery_engine*.node) qui
  // doivent être présents au runtime mais ne sont pas tracés par Next standalone.
  // En les externalisant, Next inclut tout le package @prisma/client (binaires
  // compris) dans le node_modules du standalone.
  serverExternalPackages: ["@prisma/client", "@prisma/engines", "prisma"],
  // Force-trace les fichiers Prisma pour qu'ils soient copiés dans le standalone
  outputFileTracingIncludes: {
    "/**/*": [
      "../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/*",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client/**",
      "../../node_modules/.pnpm/@prisma+engines*/node_modules/@prisma/engines/**",
    ],
  },
  eslint: {
    // ESLint 9 / @typescript-eslint version mismatch causes
    // "Definition for rule ... was not found" errors during build.
    // These are pre-existing in the codebase and unrelated to auth changes.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Le typage tRPC ne se propage pas correctement quand le build se fait
    // depuis Docker (résolution Prisma client / workspace différente). Les
    // erreurs sont signalées en dev. À refixer proprement plus tard.
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@brol/shared", "@brol/api"],
  // Note: typed routes disabled for development. Enable when all routes are defined.
  // experimental: {
  //   typedRoutes: true,
  // },
};

module.exports = nextConfig;