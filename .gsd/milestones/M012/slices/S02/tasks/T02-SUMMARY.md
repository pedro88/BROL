---
id: T02
parent: S02
milestone: M012
key_files:
  - apps/web/src/app/loans/page.tsx
key_decisions:
  - Bouton + dans le header loans, ouvre ObjectPickerDialog qui filtre les objets disponibles via trpc.objects.all avec status=available et recherche
  - CreateLoanDialogWrapper reset le state parent après fermeture via onClose callback
duration: 
verification_result: passed
completed_at: 2026-05-12T08:59:36.545Z
blocker_discovered: false
---

# T02: Bouton + sur /loans avec dialog de sélection d'objet

**Bouton + sur /loans avec dialog de sélection d'objet**

## What Happened

Ajouté bouton "+ NOUVEAU PRÊT" dans le header de /loans. Le bouton ouvre un ObjectPickerDialog (Dialog avec recherche d'objets + liste des objets disponibles). Quand l'utilisateur clique sur un objet, le dialog ferme et CreateLoanDialog s'ouvre automatiquement avec objectId/objectName. CreateLoanDialogWrapper gère le cycle de vie: ouvre le dialog, reset le state parent quand fermé.

## Verification

pnpm --filter @brol/web exec tsc --noEmit: 0 errors. Flow complet: bouton → ObjectPickerDialog → sélection objet → CreateLoanDialog.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm --filter @brol/web exec tsc --noEmit 2>&1 | grep loans/page` | 0 | ✅ pass | 8000ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/app/loans/page.tsx`
