# S01: Sign-up password UX + validation

**Goal:** Ajout d'un champ de confirmation du mot de passe, d'un toggle visibility (icône œil), et d'un feedback visuel sur la force du mot de passe côté client.
**Demo:** Après S01 : le formulaire d'inscription affiche la force du mot de passe, la confirmation, et le toggle visibility.

## Must-Haves

- Champ de confirmation du mot de passe (doit correspondre)
- Icône œil à côté des champs password (toggle visibility)
- Feedback visuel si mot de passe trop court (<8), manquant majuscule/chiffre/spécial
- Messages d'erreur traduits (fr)

## Proof Level

- This slice proves: Vérification manuelle : soumettre un mot de passe trop court / sans majuscule / sans chiffre → message clair ; soumettre un mot de passe différent de la confirmation → message ; eye icon toggle → masque/affiche le mot de passe.

## Integration Closure

Le formulaire d'inscription reste fonctionnel — submit envoie les données au même endpoint BetterAuth sans modification du backend.

## Verification

- N/A — fix UI

## Tasks

- [x] **T01: Add password confirmation field + strength indicator + visibility toggle** `est:2h`
  1. Lire le fichier apps/web/src/app/sign-in/page.tsx
  2. Ajouter un champ passwordConfirm (input type=password, label 'Confirmer le mot de passe')
  3. Ajouter la logique de validation : password === passwordConfirm
  4. Ajouter 2 icônes œil (toggle show/hide) à côté des champs password et confirmPassword
  5. Ajouter un indicateur visuel de force (barre colorée + texte : 'Trop court', 'Faible', 'Correct', 'Fort') basé sur : longueur ≥8, majuscule, chiffre, spécial
  6. Afficher les erreurs : 'Les mots de passe ne correspondent pas', 'Doit contenir ≥8 caractères', etc.
  7. Traduire tous les messages en français
  8. Garder le même style VHS
  - Files: `apps/web/src/app/sign-in/page.tsx`
  - Verify: Playwright: remplir le formulaire avec des mots de passe différents → erreur 'Les mots de passe ne correspondent pas' ; avec mot de passe court → feedback visuel ; clic sur icône œil → affiche le mot de passe

## Files Likely Touched

- apps/web/src/app/sign-in/page.tsx
