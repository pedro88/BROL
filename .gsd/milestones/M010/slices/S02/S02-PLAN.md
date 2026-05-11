# S02: Local IP detection helper

**Goal:** Script Node.js autonome qui détecte l'IP locale LAN et affiche l'URL complète à coller dans .env.local.
**Demo:** User can run `node scripts/get-local-ip.js` to get their LAN IP instantly.

## Must-Haves

- scripts/get-local-ip.js s'exécute sans dépendances npm\n- Affiche l'IP LAN likely (192.168.x.x / 10.x.x.x / 172.16-31.x.x)\n- Affiche l'URL complète prête à copier dans .env.local"

## Proof Level

- This slice proves: manuel: lancer le script et vérifier que l'IP est joignable depuis le navigateur du téléphone.

## Integration Closure

Script autonome, aucune intégration nécessaire.

## Verification

- Aucun.

## Tasks

- [x] **T06: Créer le script get-local-ip.js** `est:15min`
  Créer scripts/get-local-ip.js qui utilise os.networkInterfaces() pour lister les interfaces réseau, filtre les IPs LAN (192.168.x.x, 10.x.x.x, 172.16-31.x.x), et affiche l'URL. Exclut loopback (127.x) et link-local.
  - Files: `scripts/get-local-ip.js`
  - Verify: node scripts/get-local-ip.js

## Files Likely Touched

- scripts/get-local-ip.js
