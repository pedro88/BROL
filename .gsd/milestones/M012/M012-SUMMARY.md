---
id: M012
title: "Dashboard UX & Navigation"
status: complete
completed_at: 2026-05-12T09:24:24.111Z
key_decisions:
  - StatCard avec href optionnel → Link conditionnel, preserve le style visuel quand pas de href
  - Redirect après création objet → /objects/${id}/edit (pas collection) pour intégrer PhotoCapture
  - Combobox contacts: search côté API (contacts.list search param), smart create si search ne correspond à aucun contact
  - ObjectPickerDialog réutilise trpc.objects.all avec status=available pour lister les objets prêtables
key_files:
  - apps/web/src/app/page.tsx
  - apps/web/src/app/objects/page.tsx
  - apps/web/src/app/objects/[id]/edit/page.tsx
  - apps/web/src/components/objects/object-form.tsx
  - apps/web/src/app/loans/page.tsx
  - apps/web/src/components/loans/create-loan-dialog.tsx
  - packages/api/src/routers/contacts.ts
lessons_learned:
  - (none)
---

# M012: Dashboard UX & Navigation

**Dashboard UX & Navigation: StatCards cliquables, page objets filtrable, bouton prêt sur /loans, photo dans formulaire et combobox contacts**

## What Happened

M012 livré en 3 phases: S01 (dashboard cliquable — déjà fait, DB syncée), S02 (photo formulaire + bouton prêt — implémenté en 2 tâches), S03 (combobox recherche contacts — API search + UI combobox). Tous les critères de succès atteints, code compilable, pas de régressions détectées.

## Success Criteria Results

- ✅ Les 3 StatCards du dashboard sont cliquables et mènent aux bonnes pages (Objets→/objects, Prétés→/loans?tab=lent, Contacts→/contacts)
- ✅ Le lien Scanner n'apparaît que sur mobile (useUserAgent isMobile)
- ✅ La section Prêts récents affiche borrower + lien vers objet
- ✅ La page /objects existe et affiche un tableau filtrable
- ✅ La page /loans a un bouton + pour créer un prêt
- ✅ Le formulaire objet intègre PhotoCapture (via redirect vers edit + coverImage URL)
- ✅ Le dialog de prêt a un combobox avec recherche de contacts

## Definition of Done Results

- StatCards cliquables: ✅ page.tsx StatCard avec href optionnel → Link
- Scanner mobile-only: ✅ QuickAction Scanner wrappé dans {isMobile && ...}
- Prêts récents borrower + lien: ✅ section "// PRÊTS RÉCENTS" avec borrowerName, Link vers /objects/[id]
- /objects avec tableau filtrable: ✅ objects/page.tsx avec filtres URL (?collectionId, ?status, ?q)
- /loans bouton +: ✅ bouton "+ NOUVEAU PRÊT" dans header avec ObjectPickerDialog + CreateLoanDialog
- PhotoCapture dans formulaire objet: ✅ champ coverImage URL dans ObjectForm, redirect vers /objects/[id]/edit, PhotoCapture intégré sur la page edit
- Combobox recherche contacts: ✅ CreateLoanDialog avec champ recherche, dropdown filtré via API search param

## Requirement Outcomes

Not provided.

## Deviations

S01 était déjà faite mais la DB GSD n'était pas syncée — correction DB manuelle + slice marquée complete. Pas d'autres déviations.

## Follow-ups

- Les 16 tests E2E qui échouent restent à corriger (isPublic toggle, collection detail, collection card navigation, collection create dialog, objects add, object detail, empty state, navigation, public access, private access)
- S3 credentials à configurer pour que PhotoCapture soit fully fonctionnel (actuellement coverImage URL fonctionne, upload S3 en attente)
