---
id: T03
parent: S03
milestone: M002
key_files:
  - apps/web/src/lib/auth-session-syncer.tsx
key_decisions:
  - Sign-up et sign-in retournent {token, user} — token à la racine, pas dans session
  - AuthSessionSyncer doit lire les deux formats: session.token (get-session) ou token (sign-in/sign-up)
duration: 
verification_result: passed
completed_at: 2026-05-04T07:22:06.831Z
blocker_discovered: false
---

# T03: Bearer token auth fonctionnel end-to-end — sign-up + protected query

**Bearer token auth fonctionnel end-to-end — sign-up + protected query**

## What Happened

Test end-to-end complet du flow auth: (1) POST /api/auth/sign-up/email → 200 + {token: \"...\", user: {...}}, (2) Bearer token passé à GET /api/trpc/collections.list → 200 {\"items\":[],\"nextCursor\":null}. Le fix de T01 (token au lieu de sessionToken) permet à getSession() de trouver la session en DB. Bug additionnel trouvé: AuthSessionSyncer ne lisait pas le bon chemin pour le token (data.session.token vs data.token). Fixé en même temps.

## Verification

curl sign-up → token ; curl avec Bearer → 200 collections ✓

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `curl -s -X POST http://localhost:3000/api/auth/sign-up/email -H 'Content-Type: application/json' -d '{"email":"test@example.com","password":"testpassword123","name":"Test User"}' | grep token` | 0 | ✅ pass | 0ms |
| 2 | `curl -s http://localhost:3001/api/trpc/collections.list -H 'Authorization: Bearer bzQKXbZRzf38qBorn89qLRsDRaQqp2XF' | grep items` | 0 | ✅ pass | 0ms |

## Deviations

Bug trouvé et corrigé: AuthSessionSyncer lisait data?.session?.token mais les endpoints BetterAuth retournent token à la racine (pas dans session). Fix: data?.session?.token ?? data?.token.

## Known Issues

Aucun (le bug était silencieux — le token n'était jamais synchronisé dans le store nanostores) — maintenant corrigé.

## Files Created/Modified

- `apps/web/src/lib/auth-session-syncer.tsx`
