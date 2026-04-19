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
