# M011: Photos sur les objets

**Vision:** Permettre d'ajouter des photos aux objets via capture caméra mobile, upload fichier (mobile/desktop), ou recherche Google Images optionnelle, puis de les afficher dans les vues objet.

## Slices

- [x] **S01: S01** `risk:medium` `depends:[]`
  > After this: Un provider S3/Cloudinary configuré, l'upload API fonctionne, les photos sont servies publiquement

- [x] **S02: S02** `risk:low` `depends:[]`
  > After this: Bouton qui ouvre caméra mobile ou sélecteur de fichier, preview de la photo avant envoi

- [x] **S03: S03** `risk:low` `depends:[]`
  > After this: Ajout/suppression de photos sur un objet, affichage en grille sur la page détail objet

- [x] **S04: Recherche Google Images (optionnel)** `risk:low` `depends:[S02]`
  > After this: Champ de Recherche qui affiche des résultats Google Images, sélection d'une image pour l'ajouter

## Boundary Map

Not provided.
