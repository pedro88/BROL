---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T01: Ajouter tables profil, reviews et badges au schéma Prisma

Ajouter les tables Profile (bio, avatar), Review (note 1-5, commentaire, auteur, cible, échange_id), BadgeDefinition (nom, description, icon, critères), UserBadge (user_id, badge_id, awarded_at) au schéma Prisma

## Inputs

- None specified.

## Expected Output

- `packages/db/prisma/schema.prisma mis à jour`

## Verification

pnpm --filter @brol/db generate && npx prisma validate
