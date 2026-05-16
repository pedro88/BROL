# S01: Profil utilisateur avec notes et commentaires

**Goal:** Créer la page profil utilisateur avec informations de base, liste de badges, note moyenne et commentaires des autres utilisateurs
**Demo:** Les utilisateurs peuvent voir le profil complet d'un contact avec ses notes et commentaires

## Must-Haves

- Page `/profile/[id]` affiche les infos de l'utilisateur (nom, email, avatar, bio, date d'adhésion)
- Affiche la liste des badges obtenus
- Affiche la note moyenne (1-5 étoiles) avec nombre de votes
- Affiche la liste des commentaires avec auteur, note, texte, date
- Seuls les utilisateurs ayant eu un échange peuvent Laisser un commentaire
- Les objets prêtés par l'utilisateur sont visibles sur le profil

## Proof Level

- This slice proves: End-to-end test

## Verification

- N/A - fonctionnalité initiale

## Tasks

- [x] **T01: Ajouter tables profil, reviews et badges au schéma Prisma** `est:medium`
  Ajouter les tables Profile (bio, avatar), Review (note 1-5, commentaire, auteur, cible, échange_id), BadgeDefinition (nom, description, icon, critères), UserBadge (user_id, badge_id, awarded_at) au schéma Prisma
  - Files: `packages/db/prisma/schema.prisma`
  - Verify: pnpm --filter @brol/db generate && npx prisma validate

- [x] **T02: Créer routers tRPC pour profile, review, badge** `est:medium`
  Créer les routers tRPC profile.get, profile.update, review.create, review.list, review.canReview, badge.list, badge.definitions, badge.award
  - Files: `packages/api/src/routers/profile.ts`, `packages/api/src/routers/review.ts`, `packages/api/src/routers/badge.ts`, `packages/api/src/router.ts`
  - Verify: pnpm --filter @brol/api build && pnpm --filter @brol/api test

- [x] **T03: Créer composants UI profile (UserAvatar, StarRating, ReviewCard)** `est:small`
  Créer le composant UserAvatar avec initiales ou image, StarRating pour afficher une note, ReviewCard pour afficher un commentaire
  - Files: `apps/web/src/components/profile/`
  - Verify: pnpm --filter @brol/web build

- [x] **T04: Créer page profil /profile/[id]** `est:medium`
  Créer la page /profile/[id] avec les sections: header (avatar, nom, bio, member since), badges, statistiques (note moyenne, nb commentaires, nb prêts), liste commentaires, objets prêtés. Ajouter bouton Laisser un avis si eligible.
  - Files: `apps/web/src/app/profile/`
  - Verify: pnpm --filter @brol/web build

- [x] **T05: Créer dialog pour Laisser un avis** `est:small`
  Créer le formulaire de création de review (note 1-5 étoiles cliquable, texteoptionnel), la validation (seulement si canReview=true), et l'affichage (dialog modale)
  - Files: `apps/web/src/components/profile/leave-review-dialog.tsx`, `apps/web/src/app/profile/[id]/page.tsx`
  - Verify: pnpm --filter @brol/web build

- [x] **T06: E2E tests pour la page profil** `est:small`
  Écrire les tests E2E: navigation vers profil, affichage informations, envoi d'un commentaire (si eligible)
  - Files: `apps/web/e2e/profile.spec.ts`
  - Verify: pnpm --filter @brol/web test:e2e

## Files Likely Touched

- packages/db/prisma/schema.prisma
- packages/api/src/routers/profile.ts
- packages/api/src/routers/review.ts
- packages/api/src/routers/badge.ts
- packages/api/src/router.ts
- apps/web/src/components/profile/
- apps/web/src/app/profile/
- apps/web/src/components/profile/leave-review-dialog.tsx
- apps/web/src/app/profile/[id]/page.tsx
- apps/web/e2e/profile.spec.ts
