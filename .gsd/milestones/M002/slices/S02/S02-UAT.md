# S02: Collections publiques — UAT

**Milestone:** M002
**Written:** 2026-05-04T07:12:19.586Z

## UAT — S02: Collections publiques

### Setup
- API server running on :3001
- Web server running on :3000

### UC1: Collections listPublic endpoint
```
curl http://localhost:3001/api/trpc/collections.listPublic
→ {"result":{"data":{"json":{"items":[],"nextCursor":null}}}}
```
✅ Retourne {items: [], nextCursor: null} — aucune collection publique en DB (état attendu)

### UC2: getPublic avec ID invalide
```
curl "http://localhost:3001/api/trpc/collections.getPublic?input=..."
→ 400 Bad Request (Zod cuid validation) ✅
```

### UC3: /browse renders without auth
```
curl -o /dev/null -w "%{http_code}" http://localhost:3000/browse
→ 200 ✅
```
Page affiche "COLLECTIONS PUBLIQUES" + état vide (aucune collection publique en DB)

### UC4: isPublic in Prisma schema
```
grep isPublic packages/db/prisma/schema.prisma
→ isPublic    Boolean  @default(false) ✅
→ @@index([isPublic]) ✅
```

### UC5: Zod schema includes isPublic
```
grep -A1 "isPublic" packages/shared/src/schemas/index.ts
→ isPublic: z.boolean().default(false) (createCollectionSchema) ✅
→ isPublic: z.boolean().optional() (updateCollectionSchema) ✅
```

### UC6: Toggle exists in dialog
```
grep "isPublic" apps/web/src/components/collections/create-collection-dialog.tsx
→ ≥6 occurrences (Toggle, setValue, Label, aria-checked) ✅
```

### Pass criteria
- [x] listPublic endpoint → 200 JSON
- [x] getPublic endpoint → Zod validation errors
- [x] /browse → HTTP 200
- [x] isPublic in schema + DB
- [x] isPublic toggle in CreateCollectionDialog

