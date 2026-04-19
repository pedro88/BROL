# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? | Made By |
|---|------|-------|----------|--------|-----------|------------|--------|
| D001 | M001 | styling | UI aesthetic | VHS 80s retro | Project name "brol" (bordel) inspired a retro aesthetic; dark theme with neon glows fits the collection/inventory vibe | No | collaborative |
| D002 | M001 | api | API style | tRPC | Type-safe, shares Zod schemas between client and server; already in deps | Yes — if client needs public REST endpoints | agent |
| D003 | M001 | data | Data layer | PostgreSQL + Prisma | Relational data (loans between users), Prisma schema designed, PostgreSQL already chosen | Yes — if switching to Supabase or PlanetScale | agent |
| D004 | M001 | validation | Input validation | Zod (shared package) | Zod schemas defined in `@brol/shared`, imported by both `@brol/api` and web components | No | agent |
| D005 | M001 | ui | Edit approach | Page-based edit (not dialog) | Complexity handling; edit routes live at `/objects/[id]/edit` | Yes — if dialog UX proves better for simple edits | agent |
| D006 | M001 | confirm | Delete confirmation | native confirm() | Simple, no UI component needed for one-off confirmation | Yes — if a custom modal is desired | agent |
| D007 | M001 | data | Data source | Mock data | Auth not integrated yet; UI built with mock data for demo purposes | Superseded by M002 (auth integration) | collaborative |
| D008 | M001 | tech | Router strategy | Disabled typedRoutes experimental feature | Type generation issues; fell back to native Next.js routes | Superseded if typedRoutes is stabilized | agent |
| D009 | M001 | mobile | Mobile framework | Expo + expo-router | File-based routing, native mobile, QR camera access via expo-camera/expo-barcode-scanner | Yes — if React Native CLI needed | agent |
| D010 | M001 | mobile | Mobile theme | Dark theme matching web | Consistent brand across platforms | No | agent |
| D011 | M002 | auth | Authentication library | BetterAuth | Prisma schema already has Account/Session/VerificationToken models; BetterAuth integrates with Next.js | Yes — if BetterAuth doesn't support mobile Oauth flows | human |
| D012 | M002 | api | API deployment target | Vercel serverless functions | Planned; current server.ts is standalone HTTP for dev only | Yes — if Railway or other platform chosen | agent |
| D013 | M002 | pagination | Pagination style | Cursor-based with limit | Used consistently across all list queries; cursor = last item id | No | agent |
| D014 | M002 | i18n | i18n approach | Static JSON locale files (fr, nl, en) | Files exist but not wired into the app yet; to be integrated in M002 or M003 | Yes — if dynamic i18n needed | agent |
| D015 | M002/S01 | auth | OAuth providers | Google + GitHub + Apple (all three) | Apple required by user. Google quasi-mandatory. GitHub adds flexibility. All three supported natively by BetterAuth. | Yes — if Apple JWT rotation proves unworkable in production | human |
| D016 | M002/S01 | auth | Apple OAuth client secret | JWT ES256 client secret generated at module load from env vars (APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY) | Apple requires a dynamic JWT as client secret. PKCS#8 private key loaded from env. Module-level generation means API restart regenerates it. No external dependency needed. | Yes — if automated rotation needed | agent |
| D017 | M002/S01 | auth | Session configuration | HTTP-only cookie, 7 days expiry, daily refresh | BetterAuth defaults. 7 days is long enough for a personal inventory app without being insecure. Daily refresh means active users stay logged in indefinitely. | Yes — if security posture needs tightening | agent |
| D018 | M002/S01 | api | User ID extraction in tRPC context | auth.api.getSession({ headers }) in createContext → ctx.userId | Server-side extraction. Returns null if no valid session. Works with any HTTP adapter. Directly populates Context.userId for protectedProcedure. | No | agent |
| D019 | M002/S02 | arch | Public collection granularity | Collection-level only. Objects inherit public status from parent collection. | Simpler model. Owner controls at collection level. No per-object toggle needed for V1. | Yes — if per-object public toggle requested later | agent |
| D020 | M002/S02 | arch | Public browse URL format | Slug-based: /c/[slug] | Prettier than /c/[cuid]. Requires uniqueness validation with collision handling. Slug auto-generated from collection name. | Yes — if slug collisions prove problematic | agent |
| D021 | M002/S04 | testing | Unit test framework | Vitest | Already supports tRPC directly via caller(). Faster than Jest. Coverage reports work out of the box. | Yes — if Jest preferred for consistency with other projects | agent |
| D022 | M002/S04 | testing | Unit test coverage target | 100% line + branch coverage on all 5 tRPC routers | Full coverage requested by user. Forces every edge case tested. Auth rejection, validation errors, not-found cases all covered. | Yes — if build times become unacceptable | human |
| D023 | M002/S05 | testing | E2E test OAuth credentials | Separate .env.test with sandbox OAuth apps (dev/test credentials only) | Production OAuth credentials should not be in test env. Sandbox apps from Google/GitHub/Apple developer portals can be used for testing without exposing production secrets. | Yes — if sandbox apps not available | agent |
