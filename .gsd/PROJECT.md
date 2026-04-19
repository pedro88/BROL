# BROL — Project

**BROL** ("bordel" en français — inventory, stuff management)

A personal inventory and lending management app. Users organize belongings into collections, track who borrowed what, and manage a stock of QR codes to tag physical objects. A public scan feature lets strangers see an object's owner and send messages.

## Core Value

Stop losing track of your stuff — know where everything is, who has it, and what condition it's in.

## Current State

**M001 complete.** Collections and Objects CRUD UI exists with mock data. Web app renders, navigation works, VHS 80s theme applied. tRPC routers are built and typed. E2E tests exist but API server not included in test setup.

**Still missing:**
- Real authentication (BetterAuth planned but not integrated)
- Real data (frontend uses mock data, userId always null in context)
- Mobile app wired to backend (screens exist, no tRPC calls)
- Public QR scan (schema exists, endpoint missing)
- i18n system loaded (files exist: fr, nl, en — but not used)

## Architecture / Key Patterns

### Stack
- **Monorepo**: Turborepo (apps/web, apps/mobile, packages/api, packages/db, packages/shared, packages/eslint-config)
- **API**: tRPC (port 3001), standalone HTTP server for dev, serverless (Vercel) planned for prod
- **Database**: PostgreSQL via Prisma (`@brol/db`)
- **Frontend**: Next.js 14 App Router (port 3000), Radix UI primitives, Tailwind
- **Mobile**: Expo with expo-router (stack navigation), dark theme matching web
- **Shared**: Zod schemas (`@brol/shared`), i18n locales (fr, nl, en)
- **Tests**: Playwright e2e

### Established Patterns
- VHS 80s aesthetic: dark background, neon glows (`vhs-text-glow`), `font-display` + `font-mono`, gradients, card borders
- Component file co-location: `components/collections/`, `components/objects/`, `components/ui/`
- tRPC procedure pattern: `publicProcedure` for public, `protectedProcedure` for auth-gated
- Pagination: cursor-based with `limit` (default 20)
- SuperJSON transformer on tRPC for Date serialization

### Data Model
- `User` → owns `Collection[]` and `Contact[]`, is `ownerOf` and `borrowerOf` `Loan[]`
- `Collection` → owns `Object[]`
- `Object` → optionally linked to one `QrStock` (1:1 unique), can have one active `Loan`
- `Loan` → links `Object` to `borrower User`, tracks status and due date
- `QrStock` → generated UUID v7 codes, `used` flag, `objects[]` reverse relation

### API Structure
```
appRouter
  ├── collections  (CRUD)
  ├── objects     (CRUD + QR assignment)
  ├── loans       (lentOut, borrowed, history, create, return, remind, cancel)
  ├── contacts    (CRUD)
  ├── qr          (listStock, generateStock, assignToObject, getByCode, deleteStock)
  └── health      (public)
```

### Missing Auth Integration
- `createContext` in `packages/api/src/trpc/index.ts` returns `userId: null`
- `protectedProcedure` throws `UNAUTHORIZED` for all calls
- Prisma schema has `Account`, `Session`, `VerificationToken` (BetterAuth models ready)
- BetterAuth to be integrated in M002

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [x] M001: Collections & Objects Management — CRUD UI with mock data, VHS theme
- [ ] M002: Authentication — BetterAuth integration, real data, user isolation
- [ ] M003: Mobile Backend Wiring — Connect mobile app to tRPC API
- [ ] M004: Public QR Scan — External scan → view owner → send message
- [ ] M005: Loans Full Loop — Contact creation from loan flow, reminder emails
