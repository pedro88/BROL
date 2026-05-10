# S01: Sign-up password UX + validation — UAT

**Milestone:** M008
**Written:** 2026-05-10T13:54:26.526Z

## UAT — S01

**Scenario 1 : Mismatch password**
- [ ] /sign-in → mode "Créer un compte"
- [ ] password = "TestPass123!", confirm = "DifferentPass123!"
- [ ] Message "Les mots de passe ne correspondent pas" visible
- [ ] Submit disabled (bouton grisé)

**Scenario 2 : Strength indicator**
- [ ] "abc" → "Trop court" (barre rouge, 25%)
- [ ] "abcdefgh" → "Faible" (barre orange, 50%)
- [ ] "Abcdef12" → "Correct" (barre jaune, 75%)
- [ ] "Abcdef12!" → "Fort" (barre verte, 100%)

**Scenario 3 : Toggle**
- [ ] Icône œil → type="text" (password visible)
- [ ] Icône œil barré → type="password" (masqué)
- [ ] Fonctionne sur les 2 champs
