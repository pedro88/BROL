#!/usr/bin/env bash
# postinstall: regenerate Prisma client + ensure node_modules/.prisma symlink.
#
# pnpm with `node-linker=hoisted` writes the generated client to a buried
# `.pnpm/@prisma+client@*/node_modules/.prisma/client/` path, but the
# hoisted `node_modules/@prisma/client/index.js` does
# `export * from '.prisma/client/default'` which resolves at
# `node_modules/.prisma/client/default` — so we symlink that root location
# to the actual generated directory.

set -e
cd "$(dirname "$0")/.."

# 1. generate the client into the .pnpm store
pnpm --filter @brol/db generate

# 2. find the actual .prisma directory pnpm wrote
GEN_DIR=$(find node_modules/.pnpm -maxdepth 4 -type d -name ".prisma" 2>/dev/null | head -1)

if [ -z "$GEN_DIR" ]; then
  echo "[postinstall] WARNING: no generated .prisma dir found under node_modules/.pnpm — Prisma client will fail at runtime"
  exit 0
fi

# 3. compute the relative path and create / refresh the symlink
REL=$(realpath --relative-to=node_modules "$GEN_DIR")
ln -sfn "$REL" node_modules/.prisma
echo "[postinstall] node_modules/.prisma -> $REL"
