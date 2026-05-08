# M002: Auth + Collections publiques

## Vision

BetterAuth OAuth (Google, GitHub, Apple) + email/password intégrés. Collections publiques browsable sans login. Données réelles via tRPC (plus de mock). Tests unitaires et e2e full coverage.

## Slices

- [x] **S01: Auth BetterAuth + OAuth** `risk:high` `depends:[]`
  > After this: User can sign in with Google/GitHub/Apple OAuth or email/password, session persists, protected queries return real user data

- [x] **S02: Collections publiques** `risk:medium` `depends:[S01]`
  > After this: Anyone can browse public collections at /browse, public collections accessible at /c/[id] without login

- [x] **S03: Mock data → real tRPC queries** `risk:medium` `depends:[S01]`
  > After this: Collections and objects pages show real DB data, objects can be added to real collections

- [x] **S04: Tests unitaires routers tRPC** `risk:medium` `depends:[S01,S02,S03]`
  > After this: vitest run passes with 100% coverage on all 5 routers

- [x] **S05: Tests e2e OAuth + public visibility** `risk:low` `depends:[S01,S02]`
  > After this: playwright test passes: auth form + public browse + middleware redirects + OAuth tests skipped (credentials not configured)

- [ ] **S06: Tests e2e complets (tous les cas)** `risk:medium` `depends:[S01,S02,S03,S04,S05]`
  > After this: Tous les edge cases e2e testés — sign-up/sign-in/session persistence/sign-out + collections CRUD + objects CRUD + browse public + form validation + error handling + responsive. Zéro test skippé (sauf OAuth credentials).

## Boundary Map

Not provided.
