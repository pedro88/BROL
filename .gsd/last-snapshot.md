# GSD context snapshot (2026-05-04T08:14:46.948Z)

## Top project memories
- [MEM002] (architecture) Mode d'authentification pour M002 Chose: Email + mot de passe via BetterAuth emailAndPassword, OAuth commenté. Rationale: OAuth (Google/GitHub/Apple) requiert des credentials non-configurés. Email+password avec BetterAuth fonctionne out-of-box, permet d'avancer sur S02 et le reste de M002 sans dépendre des consoles OAut….
- [MEM003] (architecture) Algorithme de hashage pour les mots de passe Chose: bcrypt avec cost factor 12. Rationale: bcrypt est le standard pour le hashage de mots de passe : auto-salted, cost factor configurable, implémenté nativement dans le runtime Node.js via crypto.randomBytes + crypto.createHash (bien que mieux via une lib). BetterAuth utilise bcrypt en interne..
- [MEM001] (gotcha) Les tests Vitest de l'API nécessitent DATABASE_URL configuré. Le fallback hardcoded dans packages/api/src/test/setup.ts (piet:brolpass@localhost/brol_test) ne fonctionne PAS — le rôle postgres réel est postgres:password. Toujours lancer les tests avec DATABASE_URL depuis .env : `DATABASE_URL="postgresql://postgres:password@localhost:5432/brol_test?schema=public" npx vitest run`
