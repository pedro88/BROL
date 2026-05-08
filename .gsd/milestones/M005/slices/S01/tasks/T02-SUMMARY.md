---
id: T02
parent: S01
milestone: M005
key_files:
  - apps/web/src/components/navigation.tsx
key_decisions:
  - Header is now a client component with 'use client'
  - Used useSyncExternalStore to subscribe to nanostore atom
duration: 
verification_result: untested
completed_at: 2026-05-08T06:33:01.860Z
blocker_discovered: false
---

# T02: Modified Header to display Login/Logout button based on auth state.

**Modified Header to display Login/Logout button based on auth state.**

## What Happened

Added a login/logout button to the Header. When not authenticated, shows a 'Login' link to /sign-in. When authenticated, shows a 'Logout' button that calls signOut(), clears the session token, and redirects to /sign-in. Used useSyncExternalStore to read the nanostore atom for React 19 compatibility.

## Verification

grep confirms: signOut imported, useSessionToken hook defined, Login link (href=/sign-in) and Logout button with aria-label rendered conditionally based on isAuthenticated.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| — | No verification commands discovered | — | — | — |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/components/navigation.tsx`
