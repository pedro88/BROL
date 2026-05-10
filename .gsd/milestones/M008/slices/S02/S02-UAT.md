# S02: loans.create — graceful error on missing borrower — UAT

**Milestone:** M008
**Written:** 2026-05-10T13:54:41.821Z

## UAT — S02

**Scenario : Borrower sans account**
- [ ] Créer un Contact sans borrowerId dans la DB
- [ ] Tenter un prêt avec ce contact
- [ ] Erreur lisible : "Ce contact n'a pas de compte Brol. Créez un contact lié à un compte existant..." → pas 500

**Scenario : borrowerId invalide**
- [ ] Appeler loans.create avec borrowerId = "id-invalide-qui-existe-pas"
- [ ] Erreur NOT_FOUND avec message lisible

**Scenario : Objet déjà prêté**
- [ ] Tenter un second prêt sur un objet déjà prêté
- [ ] Erreur CONFLICT "Cet objet est déjà prêté"
