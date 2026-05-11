# Project Knowledge

## Dev Rules

- **Avant de lancer un serveur**, toujours vérifier et libérer le port :
  ```bash
  lsof -i :PORT  # Vérifier
  kill $(lsof -t -i :PORT)  # Libérer si occupé
  ```

## QR Code — Test local avec téléphone

Pour tester les QR codes depuis un téléphone sur le même réseau WiFi :

1. **Détecter votre IP locale :**
   ```bash
   node scripts/get-local-ip.js
   # → NEXT_PUBLIC_APP_URL="http://192.168.x.x:3000"
   ```

2. **Configurer l'URL dans `.env.local` :**
   ```
   # apps/web/.env.local
   NEXT_PUBLIC_APP_URL="http://192.168.x.x:3000"
   ```

3. **Démarrer le serveur sur toutes les interfaces :**
   ```bash
   pnpm --filter @brol/web dev:lan
   ```

4. **Scanner** depuis le téléphone sur le même WiFi.

> ⚠️ L'IP LAN peut changer si le DHCP réattribue les baux — relancez `get-local-ip.js` si le scan échoue.

## Project Notes

- Monorepo Turborepo avec apps web, mobile et packages shared/db/api
- API tRPC sur port 3001, Web Next.js sur port 3000
- Auth via BetterAuth (à intégrer)
