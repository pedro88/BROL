# Brol — Gestion de prêt d'objets

Application belge de gestion de prêt et location d'objets via QR codes.

## Stack technique

- **Monorepo**: Turborepo
- **Frontend web**: Next.js 15, Tailwind CSS, shadcn/ui (thème VHS 80s)
- **App mobile**: Expo (React Native)
- **Backend**: tRPC, Node.js
- **Base de données**: PostgreSQL + Prisma ORM
- **Validation**: Zod
- **Auth**: BetterAuth
- **i18n**: FR / NL / EN

## Structure du projet

```
brol/
├── apps/
│   ├── web/          # Application Next.js
│   └── mobile/       # Application Expo
├── packages/
│   ├── shared/       # Schémas Zod, types, utils, i18n
│   ├── db/           # Prisma ORM
│   └── api/          # Routes tRPC
├── DECISIONS.md      # Registre des choix techniques
└── package.json
```

## Installation

```bash
# Installer pnpm si nécessaire
npm install -g pnpm@9

# Installer les dépendances
pnpm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs
```

## Commandes

```bash
# Développement
pnpm dev              # Lance tous les apps en parallèle
pnpm dev --filter=@brol/web    # Web uniquement
pnpm dev --filter=@brol/mobile # Mobile uniquement

# Build
pnpm build            # Build complet

# Base de données
pnpm db:generate      # Génère le client Prisma
pnpm db:push          # Push le schéma
pnpm db:migrate       # Migration
pnpm db:studio        # Interface Prisma

# Tests
pnpm test             # Tests unitaires
pnpm test:e2e         # Tests E2E (Playwright)
```

## Ports & Services

**Avant de lancer un serveur**, vérifier et libérer le port nécessaire :

```bash
# Vérifier si un service tourne sur le port
lsof -i :3001  # API
lsof -i :3000  # Web

# Tuer le processus existant
kill $(lsof -t -i :3001)
```

## Développement

1. Créer une branche: `git checkout -b feature/nom`
2. Implémenter
3. Commits conventionnels: `git commit -m "feat: description"`
4. Push: `git push -u origin feature/nom`
5. Créer une PR sur GitHub

## Variables d'environnement

Voir `.env.example` pour la configuration complète.

## Licence

MIT
