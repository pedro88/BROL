# S03: Mock data → real tRPC queries — UAT

**Milestone:** M002
**Written:** 2026-05-04T07:22:31.635Z

## UAT — S03: Mock data → real tRPC queries

### API server startup
```
API server running on :3001 ✅
GET /api/trpc/health → 200 {"status":"ok"} ✅
GET /api/trpc/collections.list → 401 UNAUTHORIZED (sans auth) ✅
```

### Bearer token auth (après fix T01)
```
POST /api/auth/sign-up/email → 200 {"token":"...","user":{...}} ✅
GET /api/trpc/collections.list + Authorization: Bearer <token> → 200 {"items":[],"nextCursor":null} ✅
```

### AuthSessionSyncer (après fix)
```
data?.session?.token ?? data?.token → lit correctement token de sign-up/sign-in ✅
```

### Pass criteria
- [x] API server starts without Prisma errors
- [x] Protected endpoint returns 401 without auth
- [x] Protected endpoint returns 200 with valid Bearer token
- [x] AuthSessionSyncer reads token from sign-up/sign-in response

