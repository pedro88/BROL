# M017: Mobile Avancé — Scanner QR, Notifications, Profile, Settings, Browse

**Vision:** Ajouter les fonctionnalités mobiles avancées : scanner QR code fonctionnel pour assigner/lire des objets, système de notifications in-app, page profile/settings avec tier management, page browse pour collections publiques, et requests communautaire.

## Scope (inclus)
- **QR Scanner**: expo-camera réel, lecture code, routing vers objet/contact
- **QR Assignment**: assigner un QR stock à un objet (via scanner)
- **Notifications**: liste, mark as read, badge sur tab icon
- **Profile**: consultation profil public (reviews, badges)
- **Settings**: tier, compte, logout
- **Browse**: parcours public (collections publiques sans auth)
- **Requests communautaire**: liste demandes, création, fulfillment

## Scope (exclu)
- Email notifications (→ backend email service, hors scope mobile)
- OAuth providers (Google/GitHub/Apple) — prêts mais non configurés

## Dépendances
- M015 (Infrastructure) — QR code display nécessite le même pattern QR
- M016 (Core Features) — requiert les screens de base pour naviguer depuis les notifications

## Défis Known
- expo-camera: needs explicit camera permission request on iOS (NSCameraUsageDescription already in app.json)
- Notification badge: utiliser `expo-badge` ou react-native tab bar badge