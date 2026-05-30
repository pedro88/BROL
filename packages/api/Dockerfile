# =============================================================================
# Dockerfile pour @brol/api — serveur tRPC + Better-auth
# Build multi-stage : on bundle avec esbuild, on copie seulement le strict minimum
# dans l'image finale.
# =============================================================================

# ---------- Base : Node 22 + pnpm ----------
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# OpenSSL est requis par Prisma à DEUX moments :
#   1. `prisma generate` (stage builder) — pour détecter la cible et bundler
#      le bon engine .node
#   2. Au runtime (stage runner) — pour charger l'engine
# On l'installe dans `base` pour qu'il soit dispo dans les deux stages.
# Sans openssl ici, `prisma generate` génère un engine 1.1.x mais le runtime
# (qui a openssl 3 via la même `base`) cherche un engine 3.0.x → crash.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
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
    pnpm install --frozen-lockfile --ignore-scripts

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
# Postinstall équivalent : générer le client Prisma, puis créer le symlink
# node_modules/.prisma vers la copie hoistée par pnpm. Cf. scripts/postinstall.sh
# (non copié dans l'image car la logique est inlinée ici).
RUN pnpm --filter @brol/db exec prisma generate \
 && GEN_DIR=$(find node_modules/.pnpm -maxdepth 4 -type d -name ".prisma" 2>/dev/null | head -1) \
 && if [ -n "$GEN_DIR" ]; then REL=$(realpath --relative-to=node_modules "$GEN_DIR") && ln -sfn "$REL" node_modules/.prisma; fi
RUN pnpm --filter @brol/api run build

# ---------- Runner : image finale ----------
FROM base AS runner
ENV NODE_ENV=production
# openssl est déjà installé via le stage `base` (cf. commentaire là-haut).
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
