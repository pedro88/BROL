# M002: Auth + Collections publiques

## Vision

BetterAuth email/password intégré. OAuth (Google, GitHub, Apple) commenté en attente des credentials. Collections publiques browsable sans login. Données réelles via tRPC (plus de mock). Tests unitaires et e2e partiels (OAuth skippé, full coverage dans M004).

## Notes

- S06 (Tests e2e complets) supprimé — couvert par M004 qui est plus exhaustif.

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

## Boundary Map

Not provided.
