# S04: Tests unitaires routers tRPC — UAT

**Milestone:** M002
**Written:** 2026-05-04T07:27:43.232Z

## UAT — S04: Tests unitaires routers tRPC

### Setup
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/brol_test?schema=public" \
pnpm --filter @brol/api exec vitest run
```

### Results
```
Test Files  5 passed (5)
Tests  60 passed (60)
Duration  5.02s
```

### Coverage par router
- collections.ts: 98.86% stmts
- objects.ts: 88.88% stmts  
- loans.ts: 86.25% stmts
- contacts.ts: 92.96% stmts
- qr.ts: 96.18% stmts
- Overall: 79.27% stmts

### Pass criteria
- [x] 5 test files pass
- [x] 60 tests pass (0 fails)
- [x] Collections router CRUD: list, get, create, update, delete, listPublic, getPublic
- [x] Authorization checks: other user's collection throws
- [x] isPublic filtering works

