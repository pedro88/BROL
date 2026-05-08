---
id: M003
title: "Auth: fix password hashing & schema"
status: complete
completed_at: 2026-05-04T08:32:58.968Z
key_decisions:
  - User.hashedPassword supprimé — BetterAuth utilise Account.password
  - User.avatarUrl → User.image (standard BetterAuth)
  - Account: accessTokenExpiresAt + refreshTokenExpiresAt (ex expiresAt)
  - Password hashing = scrypt (BA default, pas bcrypt)
key_files:
  - packages/db/prisma/schema.prisma
  - packages/api/src/auth.ts
  - packages/api/src/routers/loans.ts
  - packages/api/src/routers/collections.ts
  - packages/api/src/routers/objects.ts
lessons_learned:
  - BetterAuth v1.6 ne stocke PAS le hash dans User — utiliser Account.password
  - scrypt (BA) > bcrypt (plus moderne, resistant GPU/ASIC)
  - Prisma adapter utilise le schema BA par défaut — aligner le sien dessus
  - api-server doit être redémarré après prisma db push
---

# M003: Auth: fix password hashing & schema

**Schema aligné BA v1.6, password hashing scrypt, sign-up/sign-in fonctionnels**

## What Happened

M003 alignait le schema avec BetterAuth. T01 a corrigé le schema (avatarUrl→image, remove hashedPassword, Account fields). T02 a pushé en base. T03 a vérifié que signup+login fonctionnent avec Account.password scrypt hash. S02/S03 rendus obsolètes: sign-in déjà dans BA, hashedPassword supprimé du schema.

## Success Criteria Results

- ✅ Signup POST body ne contient jamais le password en clair (BA hashing)
- ✅ Account.password non-NULL pour credential provider (scrypt hash)
- ✅ Login email+password fonctionne (token renvoyé)
- ✅ Hash = scrypt (via @noble/hashes, BA default)
- ✅ Plus de migration NULL hashedPassword (champ supprimé du schema)

## Definition of Done Results

- ✅ Signup HTTP POST body ne contient pas le password en clair (BA hashing en interne)
- ✅ Account.password contient le hash scrypt (salt:key format), jamais NULL pour credential provider
- ✅ Login email+password fonctionne end-to-end (token généré)
- ✅ Hash = scrypt via @noble/hashes (BetterAuth) — moderne et resistant GPU/ASIC
- ✅ User.hashedPassword supprimé du schema (plus de migration nécessaire)

## Requirement Outcomes

- R003 (user authentication): ✅ S01 — Account.password scrypt hash, sign-in token généré. S02/S03 obsolètes.

## Deviations

bcrypt mentionné dans le plan original mais BetterAuth utilise scrypt (plus moderne). S02/S03 marqués obsolètes: S02 sign-in déjà fonctionnel via BetterAuth, S03 User.hashedPassword supprimé du schema.

## Follow-ups

["M004: Public QR scan — endpoint public pour scanner un QR et voir l'objet", "M005: Loans full loop — contact creation + reminder emails", "OAuth credentials à configurer: GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID, APPLE_CLIENT_ID"]
