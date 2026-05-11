# Rapport d'Analyse : Échecs Tests E2E

**Date** : 2026-05-11
**Fichiers** : `.gsd/debug-e2e-test-failures.md`

---

## Résumé Exécutif

| Suite | Résultat |
|---|---|
| Tests unitaires (vitest) | **74/74 passent** ✅ |
| Tests E2E (avant fix BD) | **23 passent / 63 échouent / 6 skippés** |
| Tests E2E (après `prisma db push`) | **65 passent / 21 échouent / 6 skippés** |

---

## Cause Racine 1 : Base de données vide — CORRIGÉE

### Symptôme
```
Error: createUserAPI failed: 500 Internal Server Error
PrismaClientKnownRequestError: The table `public.users` does not exist in the current database.
code: 'P2021'
```

### Diagnostic
- La base `brol` existait mais contenait **0 table**
- Migration `20260511072136_init_object_types` dans `packages/db/prisma/migrations/` jamais appliquée
- `DATABASE_URL=postgresql://postgres:password@localhost:5432/brol` → aucune table
- BetterAuth `sign-up` appelle `prisma.user.findFirst()` → 500

### Résolution appliquée
```bash
cd packages/db
DATABASE_URL="postgresql://postgres:password@localhost:5432/brol" \
  npx prisma db push --skip-generate --accept-data-loss
```
→ 9 tables créées : users, accounts, sessions, verification_tokens, collections, objects, contacts, loans, qr_stocks

### Impact
63 → 21 échecs E2E.

---

## Cause Racine 2 : Champ `type` manquant dans les helpers E2E — À CORRIGER

### Symptôme
```
Error: createCollectionAPI: {"message":"type: Required ... received: undefined"}
path: ["collections.create"], httpStatus: 400
```

### Diagnostic
| Couche | `type` dans le schéma |
|---|---|
| Prisma (`schema.prisma`) | `type ObjectType? @default(BOOK)` — nullable, défaut DB ✅ |
| tRPC (`routers/collections.ts`) | `type: z.enum(OBJECT_TYPES)` — **required** ❌ |
| Shared (`@brol/shared`) | `type: z.enum(OBJECT_TYPES)` — **required** ❌ |
| `browse.spec.ts` — `createPublicCollectionAPI` | `{ name, isPublic }` — **sans type** ❌ |
| `browse.spec.ts` — `createPrivateCollectionAPI` | `{ name, isPublic }` — **sans type** ❌ |
| `objects.spec.ts` — `createCollectionAPI` | `{ name }` — **sans type** ❌ |
| `public-collections.spec.ts` — `createPublicCollectionAPI` | `{ name, isPublic }` — **sans type** ❌ |
| `public-collections.spec.ts` — `createPrivateCollectionAPI` | `{ name, isPublic }` — **sans type** ❌ |
| `collections.spec.ts` — `createCollectionAPI` | `{ name, isPublic, type = "BOOK" }` — **OK** ✅ |

Les helpers E2E ne peuvent pas créer de collections car tRPC reject la request avant d'atteindre la DB.

---

## Cause Racine 3 (probable) : `selectedType` désynchronisé dans le dialogue — À INVESTIGUER

### Symptôme
Tests via `createCollectionViaUI` échouent avec timeout (collection non trouvée dans la liste).

### Diagnostic
Dans `create-collection-dialog.tsx`, le `useEffect` qui reset le formulaire appelle `setSelectedType("BOOK")` mais pas `setValue("type", "BOOK")`. Risque de désynchronisation entre le state `selectedType` et la valeur du form react-hook-form.

---

## Fichiers à Modifier

### 1. `apps/web/e2e/browse.spec.ts`

```typescript
// createPublicCollectionAPI (~ligne 27)
body: JSON.stringify({ name, isPublic: true, type: "BOOK" }),

// createPrivateCollectionAPI (~ligne 44)
body: JSON.stringify({ name, isPublic: false, type: "BOOK" }),
```

### 2. `apps/web/e2e/objects.spec.ts`

```typescript
// createCollectionAPI (~ligne 40)
body: JSON.stringify({ name, type: "BOOK" }),
```

### 3. `apps/web/e2e/public-collections.spec.ts`

```typescript
// createPublicCollectionAPI (~ligne 29)
body: JSON.stringify({ name, isPublic: true, type: "BOOK" }),

// createPrivateCollectionAPI (~ligne 48)
body: JSON.stringify({ name, isPublic: false, type: "BOOK" }),
```

### 4. `apps/web/src/components/collections/create-collection-dialog.tsx`

```typescript
// Dans le useEffect(reset) :
useEffect(() => {
  if (!open) {
    reset();
    setIsPublic(false);
    setSelectedType("BOOK");
    setValue("type", "BOOK"); // ← ligne à ajouter
  }
}, [open, reset]);
```

---

## Plan de Vérification

1. `bash scripts/e2e-run.sh` — rejouer l'ensemble des tests
2. Confirmer : **86 passent / 0 échouent / 6 skippés** (ou résidu isolé)
3. Si des échecs persistent : vérifier l'ordre d'exécution des tests et les dépendances inter-tests (cleanup entre tests)

---

## Questions en Suspens

- Pourquoi les migrations Prisma n'ont-elles pas été appliquées ? (`pnpm install` ne les applique pas, il faut `prisma db push` ou `prisma migrate deploy`)
- Le rôle `piet` n'existe pas dans PostgreSQL — la connexion `brol_test` avec `piet:brolpass` échouerait, mais les tests vitest passent (DATABASE_URL semble pointer sur `brol` dans l'environnement courant)
