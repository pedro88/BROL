# =============================================================================
# Dockerfile pour @brol/api — serveur tRPC + Better-auth
# Build multi-stage : on bundle avec esbuild, on copie seulement le strict minimum
# dans l'image finale.
# =============================================================================

# ---------- Base : Node 22 + pnpm ----------
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# ---------- Deps : installation des dépendances ----------
FROM base AS deps
# On copie tous les manifests workspace AVANT le code, pour maximiser le cache Docker
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages/api/package.json packages/api/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY packages/tsconfig/package.json packages/tsconfig/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

# ---------- Builder : génération Prisma + bundle esbuild ----------
FROM deps AS builder
COPY packages/db/prisma packages/db/prisma
COPY packages/db/src packages/db/src
COPY packages/db/tsconfig.json packages/db/
COPY packages/shared/src packages/shared/src
COPY packages/shared/tsconfig.json packages/shared/
COPY packages/api/src packages/api/src
COPY packages/api/tsconfig.json packages/api/
COPY packages/tsconfig packages/tsconfig
COPY tsconfig.json ./
RUN pnpm --filter @brol/db exec prisma generate
RUN pnpm --filter @brol/api run build

# ---------- Runner : image finale ----------
FROM base AS runner
ENV NODE_ENV=production
# On n'embarque que ce qui est strictement nécessaire au runtime :
#   - dist/server.js (le bundle esbuild)
#   - @prisma/client + .prisma/client (générés, externalisés par esbuild)
#   - bcryptjs (externalisé par esbuild)
#   - le schéma Prisma (utile pour les migrations exécutées dans le container)
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/db/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

EXPOSE 3001
# Utilisateur non-root pour limiter la surface en cas d'évasion
USER node
CMD ["node", "dist/server.js"]
