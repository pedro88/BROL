# M004: Fix & stabilisation des tests E2E et unitaires

**Vision:** Ramener les tests E2E de 28/76 passants à ≥95% (≥72/76), en identifiant et fixant la cause racine des échecs (probablement le serveur API non lancé + incohérence config BetterAuth), tout en préservant les 60 tests unitaires qui passent déjà.

## Success Criteria

- Les 60 tests unitaires API continuent de passer à 100%
- ≥95% des 76 tests E2E passent (au moins 72/76)
- Les E2E se lancent en une seule commande sans setup manuel
- Le bug homepage (logo → /browse) est corrigé

## Slices

- [x] **S01: S01** `risk:high` `depends:[]`
  > After this: Le serveur API est en état de répondre aux endpoints auth, les helpers E2E peuvent créer/supprimer des users sans `fetch failed`.

- [ ] **S02: Fixer le flow auth (sign-in, sign-up, erreurs) et navigation homepage** `risk:medium` `depends:[S01]`
  > After this: Les tests sign-up, sign-in, validation formulaire, toggle sign-in/sign-up passent tous. Le logo BROL redirige bien vers / au lieu de /browse.

- [ ] **S03: Fixer la persistance de session et le sign-out** `risk:medium` `depends:[S02]`
  > After this: Les tests session persistence, sign-out, et hasActiveSession passent. Les cookies sont correctement transmis entre le browser et les deux serveurs.

- [ ] **S04: Stabiliser le reste des E2E et verrouiller la CI** `risk:low` `depends:[S03]`
  > After this: 76/76 ou au pire 74/76 tests E2E passent en une exécution. Les tests collections, objects, browse, public-collections sont tous verts.

## Boundary Map

| Boundary | Upstream | Downstream |
|---|---|---|
| API server + E2E config | — | S02, S03, S04 |
| Auth UI flow | S01 | S03, S04 |
| Sessions + sign-out | S02 | S04 |
| E2E stability | S03 | — |
