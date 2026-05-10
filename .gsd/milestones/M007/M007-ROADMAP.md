# M007: M007 — Gestion des prêts

**Vision:** Permettre aux utilisateurs de prêter leurs objets à leurs contacts, suivre qui a quoi, relancer les retards par email, et consulter l'historique de chaque contact.

## Success Criteria

- Utilisateur peut créer un prêt (objet + contact + date retour optionnelle)
- Utilisateur voit ses objets prêtés avec statut OVERDUE automatique
- Utilisateur peut marquer un prêt comme retourné
- Utilisateur peut envoyer un rappel email à l'emprunteur
- Contact affiche son historique complet de prêts
- E2E tests loans + contacts passent

## Slices

- [x] **S01: S01** `risk:low` `depends:[]`
  > After this: Loan visible en API avec borrower, history-query fonctionne

- [x] **S02: S02** `risk:low` `depends:[]`
  > After this: http://localhost:3000/loans affiche prêts sortants/entrants + historique

- [x] **S03: S03** `risk:low` `depends:[]`
  > After this: http://localhost:3000/contacts affiche liste + création + détail

- [x] **S04: S04** `risk:medium` `depends:[]`
  > After this: http://localhost:3000/objects/[id] avec bouton Prêter → dialogue création prêt

- [x] **S05: S05** `risk:medium` `depends:[]`
  > After this: Email de rappel reçu dans la vraie boîte mail

## Boundary Map

```
Frontend web (Next.js /app)
  └── loans/       ← liste prêts + historique
  └── contacts/    ← liste + création + détail avec historique
  └── objects/[id] ← bouton "Prêter cet objet"
API tRPC
  └── contacts.list, .get, .create, .update, .delete
  └── contacts.loansForContact  ← historique loans par contact
  └── loans.lentOut, .borrowed, .history, .create, .return, .remind, .cancel
  └── loans.updateOverdueStatus ← détecte et met à jour les OVERDUE
  └── email.sendReminder        ← integration Resend
DB Prisma
  └── Contact.loans  ← relation loans
  └── Loan.overdue detection query
```
