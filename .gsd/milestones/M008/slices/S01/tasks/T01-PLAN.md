---
estimated_steps: 8
estimated_files: 1
skills_used: []
---

# T01: Add password confirmation field + strength indicator + visibility toggle

1. Lire le fichier apps/web/src/app/sign-in/page.tsx
2. Ajouter un champ passwordConfirm (input type=password, label 'Confirmer le mot de passe')
3. Ajouter la logique de validation : password === passwordConfirm
4. Ajouter 2 icônes œil (toggle show/hide) à côté des champs password et confirmPassword
5. Ajouter un indicateur visuel de force (barre colorée + texte : 'Trop court', 'Faible', 'Correct', 'Fort') basé sur : longueur ≥8, majuscule, chiffre, spécial
6. Afficher les erreurs : 'Les mots de passe ne correspondent pas', 'Doit contenir ≥8 caractères', etc.
7. Traduire tous les messages en français
8. Garder le même style VHS

## Inputs

- `apps/web/src/app/sign-in/page.tsx (current state)`

## Expected Output

- `apps/web/src/app/sign-in/page.tsx`

## Verification

Playwright: remplir le formulaire avec des mots de passe différents → erreur 'Les mots de passe ne correspondent pas' ; avec mot de passe court → feedback visuel ; clic sur icône œil → affiche le mot de passe

## Observability Impact

N/A — fix UI
