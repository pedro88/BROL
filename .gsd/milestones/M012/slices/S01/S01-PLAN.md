# S01: Dashboard cliquable + pages列表

**Goal:** Transformer le dashboard statique en hub de navigation avec liens vers /objects, /loans (filtered), /contacts + corriger la section Prêts récents
**Demo:** Après S01 : chaque StatCard mène à une page, la section Prêts récents est corrigée et liée

## Must-Haves

- "- StatCard Objets → /objects → tableau filtrable par collection/état/status\n- StatCard Prétés → /loans?tab=lent → historique prêtés avec filtres\n- StatCard Contacts → /contacts\n- QuickAction Scanner → masquée sur desktop\n- Section 'RETours récents' renommée 'PRÊTS RÉCENTS', cards cliquables vers /objects/[id]"

## Verification

- Run the task and slice verification checks for this slice.

## Tasks

- [x] **T01: Rendre les StatCards cliquables** `est:15 min`
  Modifier StatCard pour accepter une prop href optionnelle
  - Wrap dans Link si href fourni
  - Sinon rendu normal
  - Garder le style visuel identique
  - Files: `apps/web/src/app/page.tsx`
  - Verify: git diff --stat

- [x] **T02: Créer page /objects avec tableau filtrable** `est:1h30`
  1. Créer /apps/web/src/app/objects/page.tsx
  2. Requête trpc.objects.all (ou adapter list pour lister TOUS les objets toutes collections)
  3. Tableau HTML simple : colonnes = nom, collection, état, status
  4. Filtres : select collection + select état + select status (prêté/emprunté/retourné)
  5. Filtres pilotés par URL params (?collectionId=X&status=Y) pour bookmarkabilité
  6. Lien sur le nom de l'objet → /objects/[id]
  - Files: `apps/web/src/app/objects/page.tsx`, `packages/api/src/routers/objects.ts`
  - Verify: git diff --stat + vérification navigateur

- [x] **T03: Lier les 3 StatCards aux pages** `est:30 min`
  1. StatCard Objets → href="/objects"
  2. StatCard Prétés → href="/loans?tab=lent"
  3. StatCard Contacts → href="/contacts"
  4. Supprimer la prop variant "warning" temporaire (juste visuelle)
  - Files: `apps/web/src/app/page.tsx`
  - Verify: git diff --stat

- [x] **T04: Masquer Scanner sur desktop (mobile-only)** `est:30 min`
  1. Importer useUserAgent ou créer useMobileDevice() avec Next.js headers
  2. Masquer le QuickAction Scanner quand desktop
  3. Option: garder visible sur mobile (plus logique pour scanner QR)
  - Files: `apps/web/src/app/page.tsx`
  - Verify: git diff --stat

- [x] **T05: Corriger section Prêts récents + cards cliquables** `est:30 min`
  1. Renommer "// RETOURS RECENTS" → "// PRÊTS RÉCENTS"
  2. Dans les cards : remplacer juste object.name par [object.name] + [contact borrower name] + [date retour]
  3. Wrap les cards dans Link vers /objects/[id]
  4. La requête loansQuery.lentOut donne déjà tout (object, borrower, returnDueDate)
  - Files: `apps/web/src/app/page.tsx`
  - Verify: git diff --stat

## Files Likely Touched

- apps/web/src/app/page.tsx
- apps/web/src/app/objects/page.tsx
- packages/api/src/routers/objects.ts
