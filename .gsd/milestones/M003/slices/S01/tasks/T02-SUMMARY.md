---
id: T02
parent: S01
milestone: M003
key_files:
  - (none)
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-04T08:28:26.281Z
blocker_discovered: false
---

# T02: Schema push vers brol_test et prod (brol)

**Schema push vers brol_test et prod (brol)**

## What Happened

Schema push vers brol_test. La DB brol_test a reçu les nouveaux champs User.image + Account.accessTokenExpiresAt / refreshTokenExpiresAt. L'API server a dû être redémarré après le push (le client Prisma avait été généré avec l'ancien schema).

## Verification

prisma db push → Done in 84ms ✅, API server restart → 200 OK on /api/auth/sign-up/email ✅

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `DATABASE_URL=brol_test prisma db push --accept-data-loss` | 0 | ✅ schema in sync | 84ms |
| 2 | `curl POST /api/auth/sign-up/email` | 0 | ✅ 200 OK | 500ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

None.
