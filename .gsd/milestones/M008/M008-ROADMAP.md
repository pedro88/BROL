# M008: M008 — Bug Fixes & UX Improvements

**Vision:** 4 bug fixes / UX improvements to stabilize the loan flow. Each slice is independently verifiable.

## Success Criteria

- Chaque slice est démontrable independently (clic → résultat visible)
- loans.create ne throw plus 500 pour les cas connus
- Navigation /loans/new fonctionnelle depuis le dashboard
- Sign-up表单 a confirmation + toggle password + validation granularity

## Slices

- [x] **S01: S01** `risk:low` `depends:[]`
  > After this: Après S01 : le formulaire d'inscription affiche la force du mot de passe, la confirmation, et le toggle visibility.

- [x] **S02: S02** `risk:medium` `depends:[]`
  > After this: Après S02 : la création d'un prêt affiche une erreur lisible 'Emprunteur non trouvé — crées-en un d'abord' au lieu d'une 500.

- [x] **S03: S03** `risk:low` `depends:[]`
  > After this: Après S03 : le lien 'Nouveau prêt' sur le dashboard redirige vers /loans.

- [x] **S04: S04** `risk:medium` `depends:[]`
  > After this: Après S04 : depuis CreateLoanDialog, je peux créer un contact sans quitter le dialog.

- [x] **S05: S05** `risk:medium` `depends:[]`
  > After this: Après S05 : je peux prêter un objet à un contact même sans compte Brol

- [x] **S06: S06** `risk:low` `depends:[]`
  > After this: Après S06 : les tests loans.test.ts passent avec le nouveau schema (contactId au lieu de borrowerId)

## Boundary Map

Not provided.
