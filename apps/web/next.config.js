/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@brol/shared", "@brol/api"],
  // Note: typed routes disabled for development. Enable when all routes are defined.
  // experimental: {
  //   typedRoutes: true,
  // },
};

module.exports = nextConfig;
