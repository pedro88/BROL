# M002: Auth + Collections publiques

**Gathered:** 2026-04-19
**Status:** Draft — pending full discussion

## Project Description

Integrer BetterAuth pour OAuth (Google, GitHub, Apple), rendre les collections publiques, remplacer les mock data par des vraies queries tRPC, et ajouter des tests (unit + e2e).

## Why This Milestone

Sans auth, tout le monde voit les mêmes mock data. Sans collections publiques, pas de browse public ni de scan externe. Sans tests, on ne peut pas safely itérer.

## User-Visible Outcome

- User peut se connecter avec Google, GitHub, ou Apple
- Collections peuvent être rendues publiques (toggle dans edit)
- Collections/objects publics visibles par anyone via browse/search + scan QR
- Dashboard affiche les vraies données de l'utilisateur connecté
- Sign-in OAuth fonctionnel en e2e
- Tests unitaires sur routers tRPC passent

## Architectural Decisions (inferred)

- Auth: BetterAuth avec socialProviders (google, github, apple)
- Apple: JWT client secret (ES256), 6 mois expiry, regénération needed
- Session: HTTP-only cookie, 7 jours expiry, refresh quotidien
- Context: `auth.api.getSession({ headers })` dans `createContext` → `userId`
- Protected: tRPC `protectedProcedure` fonctionne dès que userId non-null
- Public browse: `publicProcedure` pour lecture seule sans auth
- Schema: ajout `Collection.isPublic: Boolean` + `Collection.publicSlug: String` (optionnel)
- i18n: locale depuis session ou default "fr"

## Risks and Unknowns

- Apple client secret JWT: regénération tous les 6 mois — strategy needed (env var rotation? cron job?)
- Mobile: Expo app — better-auth client pas encore configuré (M003 scope mais impacte M002 design)
- Public browse: quelle granularity ? Au niveau collection seulement ou aussi objects individuels ?
- Test coverage target: undefined yet ( Layer 4 question)

## Existing Codebase / Prior Art

- `packages/api/src/trpc/index.ts`: `createContext` avec `userId: null`, `protectedProcedure` qui throw UNAUTHORIZED
- `packages/api/package.json`: `better-auth` déjà en deps `^1.2.8`
- Prisma schema: `User`, `Account`, `Session`, `VerificationToken` models existants
- `packages/shared/src/schemas/index.ts`: Zod schemas partagés
- `apps/web/src/lib/trpc.ts`: tRPC client React
- `.env.example`: absente — à créer pour OAuth credentials

## Relevant Requirements

- R003: User authentication (primary owner: M002/S01)
- R004: User-owned data isolation (primary owner: M002/S01)
- R001: Collections CRUD (affected by isPublic addition)
- R002: Objects management (affected by real data wiring)
- R008: Public object QR scan (depends on publicProcedure + isPublic)

## Scope

### In Scope

- BetterAuth setup dans `packages/api/`, instance exportée
- OAuth: Google + GitHub + Apple
- `createContext` lit la session BetterAuth, passe `userId` au context
- `protectedProcedure` fonctionne avec vrai userId
- Collections: ajout champ `isPublic` au schema Prisma
- Public browse: nouvelle route `collections.public.list` et `collections.public.get(id)`
- Toggle isPublic dans la page edit collection
- Remplacer mock data par vrai tRPC dans les pages web
- Tests: unitaires sur routers tRPC (vitest ou autre) + e2e OAuth (Playwright)
- Mise à jour `.env.example` avec les vars OAuth

### Out of Scope / Non-Goals

- Email/password auth (OAuth only pour l'instant)
- Mobile app auth wiring (M003)
- Public user profiles / social features
- Email reminder (M005)
- Multi-device sync

## Open Questions

- Test coverage target: 100% des routers ? 80% ? juste smoke tests ?
- Apple JWT secret rotation en prod: comment ?
- Public browse granularity: collection-level seulement ?
- Credentials OAuth: déjà en possession ou à configurer ?
