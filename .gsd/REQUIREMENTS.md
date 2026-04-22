# Requirements

This file is the explicit capability and coverage contract for the project.

## Active

### R001 — Les mots de passe utilisateur doivent être hashés avec bcrypt avant stockage en base. Aucunetrace du mot de passe en clair ne doit apparaître dans les logs.
- Class: compliance/security
- Status: active
- Description: Les mots de passe utilisateur doivent être hashés avec bcrypt avant stockage en base. Aucunetrace du mot de passe en clair ne doit apparaître dans les logs.
- Why it matters: Sinon n'importe qui avec accès à la DB peut lire tous les mots de passe. De plus, bcrypt est lent par design pour ralentir les attaques par brute force.
- Source: user
- Primary owning slice: M003/S01
- Validation: mapped
- Notes: S01 corrige le signup, S02 corrige le login. Le password en clair ne traverse le réseau qu'en HTTPS (TLS) — c'est acceptable.

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | compliance/security | active | M003/S01 | none | mapped |

## Coverage Summary

- Active requirements: 1
- Mapped to slices: 1
- Validated: 0
- Unmapped active requirements: 0
