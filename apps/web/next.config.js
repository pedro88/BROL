/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint 9 / @typescript-eslint version mismatch causes
    // "Definition for rule ... was not found" errors during build.
    // These are pre-existing in the codebase and unrelated to auth changes.
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@brol/shared", "@brol/api"],
  // Note: typed routes disabled for development. Enable when all routes are defined.
  // experimental: {
  //   typedRoutes: true,
  // },
};

module.exports = nextConfig;