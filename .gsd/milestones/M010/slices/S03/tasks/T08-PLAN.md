---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T08: Documenter le workflow QR local dans KNOWLEDGE.md

Ajouter une section dans .gsd/KNOWLEDGE.md décrivant le workflow de test des QR codes en local: détection IP, configuration .env.local, démarrage du serveur.

## Inputs

- `.gsd/KNOWLEDGE.md`

## Expected Output

- `.gsd/KNOWLEDGE.md mis à jour`

## Verification

grep -i 'qr\|get-local-ip' .gsd/KNOWLEDGE.md
