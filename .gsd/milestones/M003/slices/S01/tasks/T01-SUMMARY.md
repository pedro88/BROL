---
id: T01
parent: S01
milestone: M003
key_files:
  - (none)
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-04T08:27:51.894Z
blocker_discovered: false
---

# T01: Schema User + Account aligné sur BetterAuth v1.6

**Schema User + Account aligné sur BetterAuth v1.6**

## What Happened

Renommé User.avatarUrl → User.image, retiré User.hashedPassword (BetterAuth ne l'utilise pas), aligné Account sur les champs BA (accessTokenExpiresAt, refreshTokenExpiresAt, remove tokenType/sessionState). Le password hashing scrypt est déjà dans Account.password — pas besoin de le mettre dans User. La vérification du schema via prisma validate + prisma generate a passé. Les tRPC routers ont été mis à jour pour utiliser image au lieu de avatarUrl.

## Verification

prisma validate ✅, prisma generate ✅, 60 vitest tests passent ✅, sign-up → Account.password non-NULL ✅, sign-in → token ✅

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx prisma validate` | 0 | ✅ pass | 200ms |
| 2 | `npx prisma generate` | 0 | ✅ pass | 500ms |
| 3 | `DATABASE_URL=... vitest run` | 0 | ✅ 60/60 pass | 4920ms |
| 4 | `sign-up + sign-in curl + DB check` | 0 | ✅ scrypt hash in Account.password, login works | 3000ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

None.
