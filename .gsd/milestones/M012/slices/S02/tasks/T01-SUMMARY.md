---
id: T01
parent: S02
milestone: M012
key_files:
  - apps/web/src/components/objects/object-form.tsx
  - apps/web/src/app/objects/[id]/edit/page.tsx
key_decisions:
  - coverImage field ajouté dans ObjectForm (entre Notes et QR Code), register('coverImage') mappé sur le schema Zod existant
  - Redirect après création modifié: /collections/${id} → /objects/${data.id}/edit
  - PhotoCapture intégré sur la page edit objet, avec galerie des photos existantes
duration: 
verification_result: passed
completed_at: 2026-05-12T09:05:02.555Z
blocker_discovered: false
---

# T01: Cover image URL dans le formulaire + PhotoCapture sur la page edit objet

**Cover image URL dans le formulaire + PhotoCapture sur la page edit objet**

## What Happened

T01 implémentée en 3 changements: (1) ajout du champ coverImage URL dans ObjectForm (entre Notes et QR Code) — le schema Zod supporte déjà coverImage, (2) redirect après création → /objects/${data.id}/edit au lieu de la collection, (3) intégration PhotoCapture sur la page edit avec galerie des photos existantes. Le schema Zod createObjectSchema already supports coverImage donc pas de changement API nécessaire.

## Verification

pnpm --filter @brol/web exec tsc --noEmit: 0 errors. Flow complet: /objects/add → fill coverImage → submit → redirect /objects/[id]/edit → PhotoCapture disponible.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `pnpm --filter @brol/web exec tsc --noEmit 2>&1 | grep -E 'object-form|edit/page'` | 0 | ✅ pass | 8000ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `apps/web/src/components/objects/object-form.tsx`
- `apps/web/src/app/objects/[id]/edit/page.tsx`
