# M012: Dashboard UX & Navigation

**Vision:** Le dashboard devient un vrai tableau de bord cliquable — chaque card mène à une page de détail avec filtres. Les actions rapides sont adaptées au contexte (mobile/desktop). Le formulaire d'ajout d'objet intègre directement la photo. La page des prêts a un bouton de création visible. Le dialog de prêt utilise un dropdown avec recherche.

## Success Criteria

- Les 3 StatCards du dashboard sont cliquables et mènent aux bonnes pages
- Le lien Scanner n'apparaît que sur mobile (Next.js detect 'mobile')
- La section Prêts récents affiche borrower + lien vers objet
- La page /objects existe et affiche un tableau filtrable
- La page /loans a un bouton + pour créer un prêt
- Le formulaire objet intègre PhotoCapture
- Le dialog de prêt a un combobox avec recherche de contacts

## Slices

- [x] **S01: S01** `risk:medium` `depends:[]`
  > After this: Après S01 : chaque StatCard mène à une page, la section Prêts récents est corrigée et liée

- [x] **S02: S02** `risk:low` `depends:[]`
  > After this: Après S02 : formulaire objet avec capture photo + bouton + visible sur /loans

- [x] **S03: S03** `risk:low` `depends:[]`
  > After this: Après S03 : dialog de prêt avec combobox recherche contacts

## Boundary Map

Not provided.
