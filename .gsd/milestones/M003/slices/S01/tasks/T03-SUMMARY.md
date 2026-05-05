---
id: T03
parent: S01
milestone: M003
key_files:
  - (none)
key_decisions:
  - (none)
duration: 
verification_result: passed
completed_at: 2026-05-04T08:28:42.521Z
blocker_discovered: false
---

# T03: Account.password = scrypt hash, login fonctionnel end-to-end

**Account.password = scrypt hash, login fonctionnel end-to-end**

## What Happened

Sign-up curl vers /api/auth/sign-up/email → Account.password = scrypt hash (salt:key). Sign-in avec même credentials → nouveau token. DB vérifie: password IS NOT NULL, providerId='credential'. Le hashing est scrypt (BetterAuth), pas bcrypt — le plan mentionnait bcrypt mais BA utilise scrypt (plus moderne, resistant GPU).

## Verification

sign-up → Account.password non-NULL + scrypt hash (format salt:key). sign-in → token généré. DB: providerId='credential'.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `curl POST /api/auth/sign-up/email + DB SELECT` | 0 | ✅ User + Account created, password set (scrypt) | 2000ms |
| 2 | `curl POST /api/auth/sign-in/email` | 0 | ✅ token returned | 500ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

None.
