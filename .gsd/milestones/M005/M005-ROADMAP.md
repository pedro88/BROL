# M005: Login/logout button + route redirect + dashboard real data

**Vision:** Bouton login/logout visible dans le header. La page / redirige vers /sign-in si pas de session, vers / (dashboard) si connecté. Les stats et actions rapides du dashboard affichent des vraies données depuis la DB au lieu de valeurs mockées.

## Slices

- [x] **S01: S01** `risk:high` `depends:[]`
  > After this: L'app redirige / → sign-in si non-connecté, / → dashboard si connecté. Le bouton login/logout fonctionne.

- [x] **S02: S02** `risk:medium` `depends:[]`
  > After this: Les stats du dashboard affichent des vraies données depuis la DB.

## Boundary Map

Not provided.
