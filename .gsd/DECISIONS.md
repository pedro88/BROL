# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? | Made By |
|---|------|-------|----------|--------|-----------|------------|---------|
| D001 | M002 S01 pivot | authentication | Mode d'authentification pour M002 | Email + mot de passe via BetterAuth emailAndPassword, OAuth commenté | OAuth (Google/GitHub/Apple) requiert des credentials non-configurés. Email+password avec BetterAuth fonctionne out-of-box, permet d'avancer sur S02 et le reste de M002 sans dépendre des consoles OAuth. Le code OAuth est commenté (non supprimé) pour réutilisation future. | Yes | collaborative |
| D002 | M003 | security | Algorithme de hashage pour les mots de passe | bcrypt avec cost factor 12 | bcrypt est le standard pour le hashage de mots de passe : auto-salted, cost factor configurable, implémenté nativement dans le runtime Node.js via crypto.randomBytes + crypto.createHash (bien que mieux via une lib). BetterAuth utilise bcrypt en interne. | Non | human |
| D003 | M003/S01 | security | Algorithme de hashage pour les mots de passe | scrypt via BetterAuth (via @noble/hashes/scrypt), cost参数 defaults (N=32768, r=8, p=1) | BetterAuth v1.6 utilise scrypt (noble/hashes) plutôt que bcrypt. Scrypt est moderne, resistant GPU/ASIC, et recommandé pour les passwords. Le plan original mentionnait bcrypt mais BA utilise scrypt nativement — pas la peine de changer. | Yes | agent |
| D004 |  | architecture | Provider de stockage pour les photos des objets | S3 (AWS S3 ou compatible MinIO/Backblaze) | Standard industriel, durable, pas de lock-in. Compatible avec presigned URLs pour upload direct client→S3. Non configuré actuellement — la structure et l'upload API seront prêts, les credentials viendraient après. | Yes | collaborative |
| D005 |  | architecture | API pour recherche d'images | Unsplash API (gratuite) | Alternative gratuite à Google Images. 50 req/heure en free tier, photos de qualité, API bien documentée. Nécessite une clé API Unsplash (gratuit à créer sur unsplash.com/developers). fallback: Pexels ou DuckDuckGo Images si Unsplash ne convient pas. | Yes | collaborative |
| D006 |  | architecture | API pour recherche d'images | DuckDuckGo Images API | API simple (GET request, JSON, pas de clé requise), stable, pas de lock-in, gratuit. Endpoint: https://duckduckgo.com/iu/?u={url} pour proxier les images. Alternative: Unsplash API si DuckDuckGo ne suffit pas (clé gratuite sur unsplash.com/developers). | Yes | collaborative |
