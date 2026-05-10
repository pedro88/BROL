# S04 Assessment

**Milestone:** M008
**Slice:** S04
**Completed Slice:** S04
**Verdict:** roadmap-adjusted
**Created:** 2026-05-10T14:18:50.473Z

## Assessment

S05 ajouté sur demande de l'utilisateur : on ne peut pas prêter à un contact sans account avec le schema actuel (Loan.borrowerId = User.id, required). La solution est de rendre borrowerId optional et ajouter borrowerContactId (Contact.id) pour les contacts sans compte.
