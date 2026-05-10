# S04: Inline contact creation in CreateLoanDialog — UAT

**Milestone:** M008
**Written:** 2026-05-10T13:55:16.675Z

## UAT — S04

**Scenario 1 : Création inline depuis dialog vide**
- [ ] Ouvrir CreateLoanDialog sur un objet (sans contacts)
- [ ] Cliquer "Ajouter un contact"
- [ ] Formulaire inline apparaît (nom, email optionnel, téléphone optionnel)
- [ ] Entrer nom → cliquer "Créer le contact"
- [ ] Contact créé, apparaît pré-sélectionné dans la liste
- [ ] Cliquer "Confirmer le prêt" → prêt créé

**Scenario 2 : Création inline avec contacts existants**
- [ ] Ouvrir CreateLoanDialog avec des contacts existants
- [ ] Cliquer "Ajouter un contact" (bouton en bas de la liste)
- [ ] Formulaire inline → créer un contact
- [ ] Contact apparaît dans la liste, pré-sélectionné

**Scenario 3 : Retour à la sélection**
- [ ] En mode création de contact → cliquer "Retour"
- [ ] Revient à la liste des contacts (sans avoir créé)
- [ ] Les contacts existants sont toujours là
