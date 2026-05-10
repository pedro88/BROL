# S05: Loans to contacts without Brol account — UAT

**Milestone:** M008
**Written:** 2026-05-10T14:19:30.740Z

## UAT — S05

**Scenario 1: Prêt à un contact sans compte**
- [ ] Créer un Contact (via /contacts) sans l'associer à un User
- [ ] Aller sur un objet → ouvrir CreateLoanDialog
- [ ] Sélectionner ce contact → confirmer
- [ ] Vérifier que le prêt est créé (pas d'erreur "Emprunteur non trouvé")
- [ ] Le prêt apparaît dans /loans avec le nom du contact

**Scenario 2: Prêt à un contact avec compte**
- [ ] Créer un Contact avec borrowerId (associé à un User)
- [ ] Ouvrir CreateLoanDialog, sélectionner ce contact
- [ ] Confirmer → prêt créé
- [ ] borrowerId setté, borrowerContactId=null dans la DB
