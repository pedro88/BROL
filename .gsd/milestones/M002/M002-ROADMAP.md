# M002: Auth + Collections publiques

## Vision
Integrer BetterAuth OAuth (Google, GitHub, Apple) pour l'authentification, rendre les collections publiques et browsable sans login, remplacer les mock data par des vraies queries tRPC, et ajouter des tests unit + e2e full coverage sur tous les routers.

## Slice Overview
| ID | Slice | Risk | Depends | Done | After this |
|----|-------|------|---------|------|------------|
| S01 | S01 | high | — | ✅ | User can sign in with Google/GitHub/Apple OAuth, session persists, protected queries return real user data |
| S02 | Collections publiques | medium | S01 | ⬜ | Anyone can browse public collections at /browse, public collections accessible at /c/[slug] without login |
| S03 | Mock data → real tRPC queries | medium | S01 | ⬜ | Collections and objects pages show real DB data, objects can be added to real collections |
| S04 | Tests unitaires routers tRPC | medium | S01, S02, S03 | ⬜ | vitest run passes with 100% coverage on all 5 routers |
| S05 | Tests e2e OAuth + public visibility | low | S01, S02 | ⬜ | playwright test passes: 3 OAuth sign-in flows + public browse + toggle isPublic |
