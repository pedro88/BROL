---
id: M014
title: "Profil, Notifications, Tiers et Badges"
status: complete
completed_at: 2026-05-14T12:00:39.155Z
key_decisions:
  - Enum UserTier (FREE/TIER_2/TIER_3) stocké sur Profile plutôt que User pour permettre évolution future
  - Badge service séparé (lib/badge-service.ts) plutôt que dans le router pour éviter les imports circulaires
  - Les limites de tier sont vérifiées côté API (FORBIDDEN) et affichées côté UI (barres de progression)
  - Les notifications sont créées de manière asynchrone (catch {}) pour ne pas bloquer les opérations principales
key_files:
  - packages/db/prisma/schema.prisma
  - packages/api/src/routers/profile.ts
  - packages/api/src/routers/review.ts
  - packages/api/src/routers/community-request.ts
  - packages/api/src/routers/notification.ts
  - packages/api/src/routers/tier.ts
  - packages/api/src/routers/badge.ts
  - packages/api/src/lib/badge-service.ts
  - packages/db/prisma/seed.ts
  - apps/web/src/app/profile/[id]/page.tsx
  - apps/web/src/app/requests/page.tsx
  - apps/web/src/app/notifications/page.tsx
  - apps/web/src/app/settings/page.tsx
lessons_learned:
  - (none)
---

# M014: Profil, Notifications, Tiers et Badges

**M014 complet: profil, notifications, tiers et badges implémentés**

## What Happened

Toutes les 5 slices de M014 sont terminées. Schema extensions: Profile, Review, BadgeDefinition, UserBadge, CommunityRequest, Notification, UserTier. 7 nouveaux routers tRPC. Composants UI pour profile, reviews, badges, requests, notifications. Pages: /profile/[id], /requests, /notifications, /settings. Badge seed. Tests: 99 passent.

## Success Criteria Results

- ✅ Les utilisateurs peuvent consulter le profil complet d'un contact avec ses badges, note moyenne et commentaires — page /profile/[id] créée avec tous les éléments
- ✅ Le système de demande à la communauté permet d'émettre et consulter des demandes — CommunityRequest, /requests page, createRequestDialog
- ✅ Les notifications sont envoyées et consultables — Notification table, /notifications page, auto-triggers dans loans/review/community-request
- ✅ Les limites de tier sont respectées et l'upgrade fonctionne — tier check dans collections.create, tier router avec upgrade
- ✅ Les badges sont awardés automatiquement selon les critères définis — syncUserBadges appelé dans loans/objects/review, 7 badges seedés

## Definition of Done Results

- ✅ Page profil accessible avec notes et commentaires — /profile/[id] créée, profile.get API, ReviewCard + StarRating
- ✅ Demande à la communauté fonctionnelle — CommunityRequest, createRequestDialog, /requests, notification auto
- ✅ Notifications implémentées — Notification table, router (list/markRead/markAllRead), auto-triggers dans loans/review/community-request, /notifications page
- ✅ Tiers d'utilisation fonctionnels — UserTier enum, profile.tier, tier router (getLimits/checkLimit/upgrade), limit check dans collections.create, /settings page avec barres progression
- ✅ Système de badge opérationnel — 7 BadgeDefinition seedés, badge-service.ts, syncUserBadges appelé dans 3 routers, profil affiche badges

## Requirement Outcomes

Not provided.

## Deviations

None.

## Follow-ups

- E2E tests pour les nouvelles fonctionnalités (reportés car baseline instable 60/76)
- Intégration Stripe pour les upgrades payants (tier TIER_2/TIER_3)
- Badge de badge dans le header (nombre de badges awardés)
- Email notification pour les rappels OVERDUE (actuellement juste RETURN_REMINDER)
