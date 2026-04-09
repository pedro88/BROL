# Project Knowledge

## Dev Rules

- **Avant de lancer un serveur**, toujours vérifier et libérer le port :
  ```bash
  lsof -i :PORT  # Vérifier
  kill $(lsof -t -i :PORT)  # Libérer si occupé
  ```

## Project Notes

- Monorepo Turborepo avec apps web, mobile et packages shared/db/api
- API tRPC sur port 3001, Web Next.js sur port 3000
- Auth via BetterAuth (à intégrer)
