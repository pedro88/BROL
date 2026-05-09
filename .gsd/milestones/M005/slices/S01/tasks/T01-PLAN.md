---
estimated_steps: 1
estimated_files: 3
skills_used: []
---

# T01: Analyser l'existant auth client + store

Lire le fichier apps/web/src/lib/auth-client.ts pour comprendre le helper signOut existant. Examiner comment auth-session-syncer.tsx détecte la session et expose le state.

## Inputs

- `Codebase: auth system`

## Expected Output

- `apps/web/src/lib/auth-client.ts avec signOut visible`

## Verification

grep -n 'signOut\|useSession\|useAuth' apps/web/src/lib/

## Observability Impact

Aucun — compréhension du système existant.
