---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T03: Modifier le middleware pour redirect conditionnel

Lire middleware.ts actuel et le modifier pour que / (et /settings, /collections, /loans, /contacts, /qr, /objects/*, /collections/*) redirigent vers /sign-in si pas de session valide. /browse, /sign-in, /sign-up restent publics.

## Inputs

- `BetterAuth session cookie name`

## Expected Output

- `apps/web/src/middleware.ts modifié`

## Verification

grep -n 'redirect\|sign-in\|middleware' apps/web/src/middleware.ts

## Observability Impact

Logs des redirects en dev (console.log temporaire).
