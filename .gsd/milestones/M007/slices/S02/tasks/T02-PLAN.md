---
estimated_steps: 4
estimated_files: 1
skills_used: []
---

# T02: Add loan card display with status badges

1. Créer /apps/web/src/app/loans/[id]/page.tsx (optionnel si on fait pas de détail)
2. Pour l'instant, garder la logique dans la page liste
3. Afficher les infos importantes : objet, contact, date limite, statut
4. Badge coloré pour OVERDUE (rouge), ACTIVE (vert), RETURNED (grisé)

## Inputs

- `apps/web/src/components/ui/badge.tsx`

## Expected Output

- `Affichage du statut avec badge coloré`

## Verification

Les prêts s'affichent avec le bon badge de statut
