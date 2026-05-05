# S01: Password hashing on signup

**Goal:** Corriger le flux d'enregistrement pour hasher le mot de passe avant insertion en base.
**Demo:** Signup hash un password en bcrypt avant insertion, et le login vérifie le hash.

## Must-Haves

- Signup crée un user avec hashedPassword non-NULL. Hash détecté en base = bcrypt $2. Le password en clair n'apparaît dans aucun log.

## Proof Level

- This slice proves: e2e signup → password non-nul en base + hash bcrypt détecté

## Integration Closure

User créé avec hashedPassword non-NULL. Hash détecté en base = bcrypt $2.

## Verification

- Logs signup incluent userId créé, pas le password

## Tasks

- [x] **T01: Corriger schema Account pour matcher BetterAuth** `est:30min`
  Migrer le schema Account : renommer providerAccountId → accountId, provider → providerId, retirer type (inutile), renommer les autres champs snake_case → camelCase.
  - Files: `packages/db/prisma/schema.prisma`
  - Verify: npx prisma validate && npx prisma generate

- [x] **T02: Push nouveau schema en base** `est:15min`
  npx prisma db push pour appliquer le nouveau schema en base. Vérifier que la table accounts est bien créée.
  - Verify: psql \d accounts ou équivalent

- [x] **T03: Vérifier création Account avec password hashé** `est:30min`
  Signup via le client web, puis vérifier en base : 1) User créé, 2) Account créé avec password non-NULL et providerId='credential'.
  - Verify: SELECT * FROM accounts WHERE password IS NOT NULL

## Files Likely Touched

- packages/db/prisma/schema.prisma
