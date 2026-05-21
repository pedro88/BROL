# M015: Infrastructure Mobile — tRPC + Auth + Navigation

**Vision:** Ériger le socle technique de l'app mobile : client tRPC vers l'API existante (port 3001), authentication via BetterAuth avec Bearer token stocké en secure storage, et tab navigation pour matcher l'expérience web.

## Success Criteria

- Client tRPC mobile compile et communique avec l'API
- User peut créer un compte et se connecter
- Les 5 tabs sont navigables
- Session persiste après restart
- Route guard fonctionne

## Slices

- [ ] **S01: tRPC client + TRPCProvider** `risk:high` `depends:[]`
  > After this: Le code compile, le client tRPC est configuré, les hooks useQuery/useMutation fonctionnent

- [ ] **S02: Sign-in screen** `risk:high` `depends:[S01]`
  > After this: Un user peut saisir email + password et se connecter, voir son dashboard

- [ ] **S03: Sign-up screen** `risk:medium` `depends:[S01]`
  > After this: Un user peut créer un compte avec email + password + name

- [ ] **S04: Auth state + Secure storage + Session sync** `risk:high` `depends:[S02,S03]`
  > After this: Le session token est stocké chiffré et lu au launch pour restaurer la session

- [ ] **S05: Tab navigation shell (5 tabs)** `risk:medium` `depends:[S01,S04]`
  > After this: 5 tabs visibles: Home, Collections, Objects, Loans, Profile

- [ ] **S06: Route guard + redirect** `risk:high` `depends:[S04,S05]`
  > After this: L'app redirige automatiquement vers /sign-in si pas de session

## Boundary Map

```
┌─────────────────────────────────────────────────────────┐
│                    M015 Slices                          │
├──────────┬──────────────────────────────────────────────┤
│ S01      │ tRPC client + TRPCProvider                  │
│          │ → apps/mobile/src/lib/trpc.ts               │
│          │ → apps/mobile/src/lib/trpc-provider.tsx     │
│          │ → apps/mobile/src/lib/query-client.ts       │
├──────────┼──────────────────────────────────────────────┤
│ S02      │ Sign-in screen                              │
│          │ → app/sign-in.tsx                          │
│          │ → apps/mobile/src/lib/auth-client.ts        │
│          │ Consomme: S01 tRPC client                   │
├──────────┼──────────────────────────────────────────────┤
│ S03      │ Sign-up screen                              │
│          │ → app/sign-up.tsx                          │
│          │ Consomme: S01 tRPC client                   │
├──────────┼──────────────────────────────────────────────┤
│ S04      │ Auth state + Secure storage                 │
│          │ → apps/mobile/src/lib/auth-store.ts         │
│          │ → apps/mobile/src/lib/secure-storage.ts      │
│          │ → apps/mobile/src/lib/session-sync.ts        │
│          │ Consomme: S02, S03 (sign-in/sign-up)        │
├──────────┼──────────────────────────────────────────────┤
│ S05      │ Tab navigation shell (5 tabs)               │
│          │ → app/_layout.tsx (Tabs)                    │
│          │ → app/(tabs)/home.tsx ...                  │
│          │ Consomme: S01 (tRPC), S04 (auth state)      │
├──────────┼──────────────────────────────────────────────┤
│ S06      │ Route guard (redirect /sign-in si pas auth) │
│          │ → Consomme: S04, S05                        │
└──────────┴──────────────────────────────────────────────┘
```
