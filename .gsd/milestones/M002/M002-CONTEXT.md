# M002: Auth + Collections publiques

**Gathered:** 2026-04-19
**Status:** Ready for planning

## Project Description

Intégrer BetterAuth pour OAuth (Google, GitHub, Apple), rendre les collections publiques (browse + lien), remplacer les mock data par des vraies queries tRPC, et ajouter des tests unit + e2e full coverage.

## Why This Milestone

Sans auth, tout le monde voit les mêmes mock data — pas de ownership, pas de loans, pas de personal inventory. Sans collections publiques, pas de browse public ni de scan externe. Sans tests, on ne peut pas safely itérer sur un système avec plusieurs providers OAuth.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Sign in with Google, GitHub, or Apple OAuth
- See their own collections and objects (real data, not mock)
- Toggle a collection as public/private from the edit page
- Browse public collections without being logged in
- Share a link to a public collection that anyone can view

### Entry point / environment

- Entry point: `/collections` (redirect to sign-in if not authenticated)
- Environment: local dev (ports 3000 web + 3001 API)
- Live dependencies: PostgreSQL database, BetterAuth session cookie

## Completion Class

- Contract complete means: OAuth tokens exchanged, session cookie set, `protectedProcedure` passes with real userId
- Integration complete means: Web pages load real user data, public browse returns only public collections
- Operational complete means: Session expires after 7 days, refresh works, sign-out clears cookie

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A user can sign in with Google and see their own collections (not other users')
- A user can sign in with GitHub and see their own collections
- A user can sign in with Apple and see their own collections
- A non-authenticated user can browse public collections at `/browse`
- A non-authenticated user can access a public collection via direct link `/c/[slug]`
- Toggling `isPublic` in edit page immediately reflects in public browse
- All 5 tRPC routers have 100% unit test coverage
- Playwright e2e tests pass: 3 OAuth sign-in flows + public/private visibility

## Architectural Decisions

### Auth library: BetterAuth

**Decision:** Use BetterAuth (`^1.2.8`) for OAuth authentication.

**Rationale:** Already in `@brol/api` deps. Prisma schema has Account/Session/VerificationToken models. Supports all 3 providers (Google, GitHub, Apple). Session + cookie management out of the box. Works with tRPC via cookie header.

**Alternatives Considered:**
- NextAuth — not chosen; BetterAuth is more lightweight and tRPC-native
- Manual OAuth — rejected; complexity, security risks

### Apple: JWT client secret (ES256)

**Decision:** Generate Apple client secret as a JWT signed with ES256 (PKCS#8 private key).

**Rationale:** Apple requires a dynamic JWT as client secret, not a static string. Must be regenerated every 6 months (180 days max).

**Alternatives Considered:**
- Static secret — not supported by Apple
- Third-party lib to generate — better-auth handles it natively with `jose`

### Session: HTTP-only cookie, 7 days, daily refresh

**Decision:** Default BetterAuth session config (expiresIn: 604800, updateAge: 86400).

**Rationale:** Sensible defaults. User stays logged in for a week. Session refreshed daily so expiry slides on active use.

**Alternatives Considered:**
- Shorter expiry (1-3 days) — rejected; inconvenient for a personal inventory app
- Longer expiry (30 days) — rejected; security posture

### Apple JWT secret rotation: env var reloaded on startup

**Decision:** The JWT client secret is generated at module load time from env vars (`APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`). A restart of the API server regenerates it.

**Rationale:** Simple. The secret lives in env vars. When it expires, update env + restart API.

### Public browse: collection-level granularity

**Decision:** Only collections can be public. Objects inside a private collection are never shown publicly. Objects inside a public collection are shown if their collection is public.

**Rationale:** Simpler model. Owner controls at the collection level. No per-object public toggle needed.

**Alternatives Considered:**
- Per-object public toggle — rejected; unnecessary complexity for V1
- Public objects visible without collection context — rejected; confuses ownership

### Data layer: userId from `auth.api.getSession`

**Decision:** In `createContext`, call `auth.api.getSession({ headers })` to extract the session → userId.

**Rationale:** Works server-side (tRPC context). Returns null if no valid session. Directly populates Context.userId.

### Testing: Vitest for unit, Playwright for e2e

**Decision:** Unit tests: Vitest. E2E tests: Playwright (already in project).

**Rationale:** Playwright already configured. Vitest integrates well with tRPC (can test routers directly with `caller`).

---

## Error Handling Strategy

- **OAuth provider error:** Redirect to `/sign-in?error=provider` with error message
- **Expired/invalid session:** `protectedProcedure` throws `UNAUTHORIZED` → redirect to sign-in
- **Apple JWT expired:** After 6 months, API logs a warning on startup. User must update env var and restart.
- **Database connection failure:** tRPC returns 500 with zodError null → standard error shape
- **Public browse on private collection:** Returns 404 (not 403) to avoid leaking existence

## Risks and Unknowns

- **Apple JWT rotation** — Manual restart required every 6 months. No automated rotation mechanism.
- **Mobile auth** — Expo mobile app needs its own auth client (M003 scope) but M002 design must be compatible.
- **Public browse URL** — Slug-based vs ID-based? Slug is prettier but needs uniqueness validation.
- **Test CI** — No CI pipeline yet. Tests run locally only.

## Existing Codebase / Prior Art

- `packages/api/src/trpc/index.ts` — `createContext` with `userId: null`, `protectedProcedure` throwing UNAUTHORIZED
- `packages/api/package.json` — `better-auth: ^1.2.8` already in deps
- `packages/api/src/server.ts` — Standalone HTTP server (dev), serverless planned for prod
- `packages/db/prisma/schema.prisma` — User, Account, Session, VerificationToken models ready for BetterAuth
- `packages/shared/src/schemas/index.ts` — Zod schemas for all input validation
- `apps/web/src/lib/trpc.ts` — tRPC React client (no auth cookie yet)
- `apps/web/e2e/` — Playwright already configured

## Relevant Requirements

- R003: User authentication — primary owner M002/S01
- R004: User-owned data isolation — primary owner M002/S01
- R001: Collections CRUD — extended with isPublic field
- R002: Objects management — affected by real data wiring (M002/S03)
- R008: Public object QR scan — depends on publicProcedure (M002/S02)

## Scope

### In Scope

- BetterAuth instance in `packages/api/src/auth.ts`, exported
- OAuth: Google, GitHub, Apple (JWT secret, ES256)
- `createContext` reads session via `auth.api.getSession({ headers })` → userId
- `protectedProcedure` works with real userId
- `Collection.isPublic: Boolean` in Prisma schema (default false)
- `Collection.publicSlug: String?` unique slug for pretty public URLs
- tRPC `collections.public.list` (publicProcedure, no auth)
- tRPC `collections.public.get(slug)` (publicProcedure)
- Toggle isPublic in `/collections/[id]/edit`
- Public browse page `/browse`
- Public collection page `/c/[slug]`
- Replace mock data in `/collections`, `/collections/[id]`, `/objects/add` with real tRPC
- `.env.example` with all OAuth vars
- Unit tests (Vitest): all 5 tRPC routers, 100% coverage
- E2E tests (Playwright): OAuth sign-in (3) + public browse + toggle isPublic

### Out of Scope

- Email/password auth (OAuth only)
- Mobile app auth (M003)
- Per-object public toggle
- Social features / public profiles
- Email reminders (M005)
- CI/CD pipeline

## Technical Constraints

- `BETTER_AUTH_SECRET` (32+ chars) + `BETTER_AUTH_URL` required in env
- `trustedOrigins: ["https://appleid.apple.com"]` required for Apple
- Prisma migration for `isPublic` + `publicSlug`
- `APPLE_PRIVATE_KEY` as PKCS#8 PEM multiline in env
- API restart needed after Apple secret expiry (6 months)

## Integration Points

- **Prisma** — BetterAuth writes to Account, Session, VerificationToken tables via Prisma adapter
- **tRPC context** — `createContext` calls `auth.api.getSession` and passes userId
- **tRPC client (web)** — `httpBatchLink` forwards cookies via `authClient.getCookie()` → `Cookie` header
- **Playwright** — needs OAuth test credentials in `.env.test`

## Testing Requirements

**Unit (Vitest):** 100% coverage on all 5 routers. Auth rejection tests. Validation error tests. Location: `packages/api/src/**/*.test.ts`.

**E2E (Playwright):** Google, GitHub, Apple OAuth sign-in. Public browse visible/hidden. Toggle isPublic. Location: `apps/web/e2e/auth.spec.ts`, `apps/web/e2e/public-browse.spec.ts`.

## Acceptance Criteria

### S01 (Auth)
- Google sign-in → session cookie + redirected to `/collections`
- GitHub sign-in → session cookie + redirected to `/collections`
- Apple sign-in → session cookie + redirected to `/collections`
- `protectedProcedure` throws UNAUTHORIZED without session
- `collections.list` returns only authenticated user's collections
- Sign-out clears session cookie

### S02 (Collections publiques)
- Toggle isPublic → appears/disappears from `/browse`
- Public collection at `/c/[slug]` without login
- Objects in public collection shown on `/c/[slug]`
- Private collection returns 404 at `/c/[slug]`
- Slug auto-generated from name, collision handled

### S03 (Mock → real queries)
- `/collections` shows real DB data
- `/collections/[id]` shows real objects
- `/objects/add` creates real object

### S04 (Unit tests)
- All 5 routers 100% line/branch coverage
- Auth rejection tests pass
- Validation error tests pass

### S05 (E2E tests)
- Google, GitHub, Apple OAuth sign-in e2e passes
- Public browse shows public, hides private
- Toggle isPublic → browse reflects immediately

## Open Questions

- Apple JWT rotation: restart API every 6 months acceptable?
- Public browse URL: slug-based or ID-based?
- Test OAuth credentials: separate `.env.test`?
