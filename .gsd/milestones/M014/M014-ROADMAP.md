# M014: Profil, Notifications, Tiers et Badges

**Vision:** Permettre aux utilisateurs d'avoir un profil complet avec réputation (notes, badges), de demander des emprunts à la communauté, de recevoir des notifications importantes, et d'évoluer vers des plans payants avec plus de capacités.

## Success Criteria

- Les utilisateurs peuvent consulter le profil complet d'un contact avec ses badges, note moyenne et commentaires
- Le système de demande à la communauté permet d'émettre et consulter des demandes pour des objets
- Les notifications sont envoyées et consultables (email + in-app)
- Les limites de tier sont respectées et l'upgrade vers un tier supérieur fonctionne
- Les badges sont awardés automatiquement selon les critères définis

## Slices

- [x] **S01: S01** `risk:low` `depends:[]`
  > After this: Les utilisateurs peuvent voir le profil complet d'un contact avec ses notes et commentaires

- [x] **S02: S02** `risk:medium` `depends:[]`
  > After this: Les utilisateurs peuvent envoyer une demande à la communauté pour un objet souhaité

- [ ] **S03: S03** `risk:medium` `depends:[]`
  > After this: Les utilisateurs reçoivent des notifications pour tous les événements importants

- [ ] **S04: Tiers d'utilisation et limites** `risk:medium` `depends:[S01]`
  > After this: Les utilisateurs ont accès à des plans selon leurs besoins

- [ ] **S05: Système de badge** `risk:low` `depends:[S01]`
  > After this: Les utilisateurs gagnent des badges en utilisant l'application

## Boundary Map

Not provided.
