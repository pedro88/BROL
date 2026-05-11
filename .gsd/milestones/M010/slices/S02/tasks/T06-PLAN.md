---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T06: Créer le script get-local-ip.js

Créer scripts/get-local-ip.js qui utilise os.networkInterfaces() pour lister les interfaces réseau, filtre les IPs LAN (192.168.x.x, 10.x.x.x, 172.16-31.x.x), et affiche l'URL. Exclut loopback (127.x) et link-local.

## Inputs

- None specified.

## Expected Output

- `scripts/get-local-ip.js créé`

## Verification

node scripts/get-local-ip.js
