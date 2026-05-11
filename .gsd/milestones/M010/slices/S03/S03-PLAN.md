# S03: Dev server starts on LAN IP

**Goal:** Configurer le serveur Next.js pour écouter sur toutes les interfaces (0.0.0.0) afin que les téléphones sur le même WiFi puisse y accéder.
**Demo:** npm run dev binds to 0.0.0.0 so phone can reach it.

## Must-Haves

- Le dev server écoute sur 0.0.0.0:3000 (pas 127.0.0.1:3000)\n- next.config.js est configuré\n- Documentation ajoutée à KNOWLEDGE.md"

## Proof Level

- This slice proves: manuel: démarrer le serveur, ouvrir http://<ip-lan>:3000 depuis le téléphone.

## Integration Closure

Aucun changement runtime en production.

## Verification

- Aucun.

## Tasks

- [x] **T07: Ajouter -H 0.0.0.0 au script dev** `est:10min`
  Modifier apps/web/package.json pour ajouter `dev` script qui exécute `next dev -H 0.0.0.0`. Ajouter une entrée `default` qui exécute `next dev` sans le -H pour ne pas changer le comportement par défaut des autres devs.
  - Files: `apps/web/package.json`
  - Verify: grep -A3 '"dev"' apps/web/package.json

- [x] **T08: Documenter le workflow QR local dans KNOWLEDGE.md** `est:5min`
  Ajouter une section dans .gsd/KNOWLEDGE.md décrivant le workflow de test des QR codes en local: détection IP, configuration .env.local, démarrage du serveur.
  - Files: `.gsd/KNOWLEDGE.md`
  - Verify: grep -i 'qr\|get-local-ip' .gsd/KNOWLEDGE.md

## Files Likely Touched

- apps/web/package.json
- .gsd/KNOWLEDGE.md
