# =============================================================================
# Dockerfile pour @brol/web — Stratégie "prebuilt"
#
# Le build Next.js est fait LOCALEMENT (pnpm run build dans apps/web) — c'est
# plus rapide et évite un bug Docker spécifique au prerender /404 sur Node 24
# en environnement Debian slim.
#
# Cette image ne fait que packager l'artefact .next/standalone déjà construit.
# Avant de builder l'image, lancer `deploy/build-and-deploy-web.sh` qui
# (1) build localement, (2) rsync l'artefact vers /opt/brol, (3) build l'image.
# =============================================================================

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=127.0.0.1

# L'artefact standalone contient déjà server.js + node_modules minimal.
COPY apps/web/.next/standalone ./
COPY apps/web/.next/static ./apps/web/.next/static
COPY apps/web/public ./apps/web/public

EXPOSE 3000
USER node
CMD ["node", "apps/web/server.js"]
