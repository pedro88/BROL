Probleme detecté à resoudre dans une nouvelle milestone m008:

1. pas de vréfication de mot de passe a la création d'un compte
2. erreur 500 a la création d'un prêt "Error: Emprunteur non trouvé\n at <anonymous> (/home/piet/Projets/webDev/BROL/packages/api/src/routers/loans.ts:230:15)\n at async resolveMiddleware (/home/piet/Projets/webDev/BROL/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/initTRPC-\_cqIfGlH.cjs:221:17)\n at async callRecursive (/home/piet/Projets/webDev/BROL/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/initTRPC-\_cqIfGlH.cjs:256:18)\n at async callRecursive …r@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/resolveResponse-BCkjJQIz.cjs:1969:18\n at async Promise.all (index 0)\n at async Object.resolveResponse (/home/piet/Projets/webDev/BROL/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/resolveResponse-BCkjJQIz.cjs:2184:20)\n at async fetchRequestHandler (/home/piet/Projets/webDev/BROL/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/adapters/fetch/index.cjs:27:9)"
3. lien mort sur /loans/new (click sur le dashboard)
4. via la page des objets, quand veut le préter, il faudrait pouvoir ajouter un nouveau contact directement via le formulaire

A àméliorer :
1.sur le dashboard il faut ajouter des liens sur les cards :
a. card Objets >>> lien vers une page avec un tableau qui liste tous les objets avec possibilité de filtre. colonne = [nom de l'objet - collection - état - status (prété - emprunté - disponible)]
b. card Prété >>> lien vers une page avec un tableau qui liste l'historique tous les objet prété avec possibilité de filtre. colonne = [nom de l'objet - collection - status - date de retour]
c. card contact >>> lien vers la page des contacts
d. la section Actions rapide est ok MAIS l'option scanner ne devrait être disponible que sur mobile!!!
e. la section Retour récent affiche les objet préter recemment, ça n'est pas logique, il faut la renommer "prêts récents" + dans les card avoir [nom de l'objet - nom du contact à qui il est préter - date de retour] + lien vers l'objet 2. sur la page d'ajout d'un objet il faut qu'on puisse directement mettre une photo pour ne pas avoir a repasser via la page de l'objet après sa création 3. Sur la page des prêts (/loans) il faut absolument rajouter un gros bouton "+" qui permet de faire un nouveau prêt!! 4. dans la modal de prêt d'un objet, il faudrait que le choix des contacts soit un dropdown avec champs de recherche dans la liste de ses contact

---

A FAIRE

Dans les fiches de création d'objets il faudrait modifier certaines chose :

1. Vétement > Ajouter les champs [taille - genre - couleur - matiere - marque]
2. Dans la catégorie outil > Changer le tag en "Outils" ajouter ls champs [(manuel - secteur - batterie) - marque]
3. j'aimerais vraiment ajouter la photo a la création de l'objet et non pas a l'edit comme c'est le cas actuellement
4. Sur version mobile ajouter la possibilité de scanner un qrcode pour l'assigner a l'objet créé
5. Ca n'est pas pertinant de rediriger l'user vers la modal d'edit de l'objet apres la création d el'objet
6. La modal d'edit de l'objet n'est pas adapté au type d'objet
7. Possibilité d'ajouter une caution sur les objet
8. Possibilité d'ajouter un prix de location (/jour /heure /semaine)

Il faudrait ajouter une page de profil sur laquelle on peut renseigner tous les éléments classiques + note des autres utilisateurs et commentaire. (une note et un
commentaire ne peuvent être donné que par un utilisateur avec qui il y a eu échange)

- Possibilité de faire une demande à la communauté pour emprunter un objet
- Systeme de notification [rappel de retour - rappel de retard - demande à la communauté - commentaire et note laissé]
- Tier d'utilisation [Free tier > 5 collection max - 50 objet max - 10 prêts simultané max --
  2nd Tier > 10 collections - 500 objets - 50 prêts simultané - 3€/mois -- 3rd Tier > tout illimité - 20€/mois]

---

BUG CONNU :

## Error Type

Runtime TypeError

## Error Message

Cannot read properties of null (reading 'name')

    at ObjectCard (src/components/objects/object-card.tsx:97:51)
    at <unknown> (src/app/collections/[id]/page.tsx:305:19)
    at Array.map (<anonymous>:null:null)
    at CollectionDetailPage (src/app/collections/[id]/page.tsx:304:26)

## Code Frame

95 | <User className="w-3 h-3" />
96 | <span className="font-mono text-xs">

> 97 | Prêté à {currentLoan.borrower.name}

      |                                                   ^

98 | </span>
99 | </div>
100 | )}

Next.js version: 15.5.14 (Turbopack)

---

## Error Type

Runtime TypeError

## Error Message

can't access property "name", currentLoan.borrower is null

    at ObjectCard (src/components/objects/object-card.tsx:97:30)
    at CollectionDetailPage/<.children<.children<.children<.children< (src/app/collections/[id]/page.tsx:305:19)
    at CollectionDetailPage (src/app/collections/[id]/page.tsx:304:26)

## Code Frame

95 | <User className="w-3 h-3" />
96 | <span className="font-mono text-xs">

> 97 | Prêté à {currentLoan.borrower.name}

      |                              ^

98 | </span>
99 | </div>
100 | )}

Next.js version: 15.5.14 (Turbopack)
