---
id: S01
parent: M005
milestone: M005
provides:
  - ["Header avec état auth reactif", "Protection de la racine / par middleware"]
requires:
  []
affects:
  - ["S02: Le dashboard real data dépend maintenant d'un utilisateur authentifié"]
key_files:
  - (none)
key_decisions:
  - (none)
patterns_established:
  - (none)
observability_surfaces:
  - ["Session state dans nanostore visible via useSessionToken hook"]
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-05-08T06:38:07.056Z
blocker_discovered: false
---

# S01: Login/logout button + redirect conditionnel

**Login/logout button in header + root / redirect based on auth state.**

## What Happened

S01 implemented the login/logout button in the Header component and conditional root redirect. The Header now uses useSyncExternalStore to read the nanostore session token atom and displays 'Login' or 'Logout' accordingly. The logout flow calls signOut(), clears the session token, and redirects to /sign-in. The middleware now protects the root `/` path — unauthenticated users are redirected to /sign-in with callbackUrl. Manual testing confirmed: anonymous / → /sign-in ✓, sign-up → dashboard with Logout ✓, logout → /sign-in ✓. Also added Content-Type header to signOut client to fix 415 error.

## Verification

Manual browser tests: anonymous / → /sign-in redirect ✓, signup + login → dashboard with Logout button ✓, click logout → /sign-in with Login button ✓. All assertions passed.

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

None.
