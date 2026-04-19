# Codebase Map

Generated: 2026-04-19T06:15:50Z | Files: 91 | Described: 0/91
<!-- gsd:codebase-meta {"generatedAt":"2026-04-19T06:15:50Z","fingerprint":"4437f784be4d0b8c99a63a9eb1c396a8e8a23997","fileCount":91,"truncated":false} -->

### (root)/
- `.env.example`
- `.gitignore`
- `DECISIONS.md`
- `package.json`
- `playwright.config.ts`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `README.md`
- `tsconfig.json`
- `tsconfig.tsbuildinfo`
- `turbo.json`

### apps/mobile/
- `apps/mobile/app.json`
- `apps/mobile/babel.config.js`
- `apps/mobile/index.js`
- `apps/mobile/package.json`
- `apps/mobile/tsconfig.json`

### apps/mobile/app/
- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/collections.tsx`
- `apps/mobile/app/index.tsx`
- `apps/mobile/app/loans.tsx`
- `apps/mobile/app/scan.tsx`

### apps/mobile/src/i18n/
- `apps/mobile/src/i18n/index.ts`

### apps/mobile/src/theme/
- `apps/mobile/src/theme/index.ts`

### apps/web/
- `apps/web/.eslintrc.json`
- `apps/web/next-env.d.ts`
- `apps/web/next.config.js`
- `apps/web/package.json`
- `apps/web/playwright.config.ts`
- `apps/web/postcss.config.js`
- `apps/web/tailwind.config.ts`
- `apps/web/tsconfig.json`
- `apps/web/tsconfig.tsbuildinfo`

### apps/web/e2e/
- `apps/web/e2e/collections.spec.ts`
- `apps/web/e2e/homepage.spec.ts`
- `apps/web/e2e/objects.spec.ts`

### apps/web/src/app/
- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`

### apps/web/src/app/collections/
- `apps/web/src/app/collections/page.tsx`

### apps/web/src/app/collections/[id]/
- `apps/web/src/app/collections/[id]/page.tsx`

### apps/web/src/app/collections/[id]/edit/
- `apps/web/src/app/collections/[id]/edit/page.tsx`

### apps/web/src/app/objects/[id]/
- `apps/web/src/app/objects/[id]/page.tsx`

### apps/web/src/app/objects/[id]/edit/
- `apps/web/src/app/objects/[id]/edit/page.tsx`

### apps/web/src/app/objects/add/
- `apps/web/src/app/objects/add/page.tsx`

### apps/web/src/app/settings/
- `apps/web/src/app/settings/page.tsx`

### apps/web/src/components/
- `apps/web/src/components/navigation.tsx`
- `apps/web/src/components/providers.tsx`

### apps/web/src/components/collections/
- `apps/web/src/components/collections/collection-card.tsx`
- `apps/web/src/components/collections/create-collection-dialog.tsx`

### apps/web/src/components/objects/
- `apps/web/src/components/objects/edit-object-dialog.tsx`
- `apps/web/src/components/objects/object-card.tsx`
- `apps/web/src/components/objects/object-form.tsx`

### apps/web/src/components/ui/
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/dialog.tsx`
- `apps/web/src/components/ui/dropdown-menu.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/label.tsx`

### apps/web/src/lib/
- `apps/web/src/lib/trpc-provider.tsx`
- `apps/web/src/lib/trpc.ts`
- `apps/web/src/lib/utils.ts`

### packages/api/
- `packages/api/package.json`
- `packages/api/tsconfig.json`

### packages/api/src/
- `packages/api/src/index.ts`
- `packages/api/src/router.ts`
- `packages/api/src/server.ts`

### packages/api/src/routers/
- `packages/api/src/routers/collections.ts`
- `packages/api/src/routers/contacts.ts`
- `packages/api/src/routers/loans.ts`
- `packages/api/src/routers/objects.ts`
- `packages/api/src/routers/qr.ts`

### packages/api/src/trpc/
- `packages/api/src/trpc/index.ts`

### packages/db/
- `packages/db/package.json`
- `packages/db/tsconfig.json`

### packages/db/prisma/
- `packages/db/prisma/schema.prisma`

### packages/db/src/
- `packages/db/src/client.ts`
- `packages/db/src/index.ts`

### packages/eslint-config/
- `packages/eslint-config/index.js`
- `packages/eslint-config/package.json`

### packages/shared/
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/tsconfig.tsbuildinfo`

### packages/shared/locales/
- `packages/shared/locales/en.json`
- `packages/shared/locales/fr.json`
- `packages/shared/locales/nl.json`

### packages/shared/src/
- `packages/shared/src/index.ts`

### packages/shared/src/i18n/
- `packages/shared/src/i18n/index.ts`

### packages/shared/src/schemas/
- `packages/shared/src/schemas/index.ts`

### packages/shared/src/types/
- `packages/shared/src/types/index.ts`

### packages/shared/src/utils/
- `packages/shared/src/utils/index.ts`

### packages/tsconfig/
- `packages/tsconfig/package.json`
