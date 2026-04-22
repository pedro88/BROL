# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? | Made By |
|---|------|-------|----------|--------|-----------|------------|---------|
| D001 | M002 S01 pivot | authentication | Mode d'authentification pour M002 | Email + mot de passe via BetterAuth emailAndPassword, OAuth commenté | OAuth (Google/GitHub/Apple) requiert des credentials non-configurés. Email+password avec BetterAuth fonctionne out-of-box, permet d'avancer sur S02 et le reste de M002 sans dépendre des consoles OAuth. Le code OAuth est commenté (non supprimé) pour réutilisation future. | Yes | collaborative |
| D002 | M003 | security | Algorithme de hashage pour les mots de passe | bcrypt avec cost factor 12 | bcrypt est le standard pour le hashage de mots de passe : auto-salted, cost factor configurable, implémenté nativement dans le runtime Node.js via crypto.randomBytes + crypto.createHash (bien que mieux via une lib). BetterAuth utilise bcrypt en interne. | Non | human |
