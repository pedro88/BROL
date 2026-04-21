# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? | Made By |
|---|------|-------|----------|--------|-----------|------------|---------|
| D001 | M002 S01 pivot | authentication | Mode d'authentification pour M002 | Email + mot de passe via BetterAuth emailAndPassword, OAuth commenté | OAuth (Google/GitHub/Apple) requiert des credentials non-configurés. Email+password avec BetterAuth fonctionne out-of-box, permet d'avancer sur S02 et le reste de M002 sans dépendre des consoles OAuth. Le code OAuth est commenté (non supprimé) pour réutilisation future. | Yes | collaborative |
