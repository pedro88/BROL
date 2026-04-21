# S01: Auth BetterAuth + OAuth 3 providers — UAT

**Milestone:** M002
**Written:** 2026-04-19T12:44:46.689Z

## UAT Checks

### Authentication Flow
- [ ] `/collections` → 307 redirect to `/sign-in?callbackUrl=%2Fcollections`
- [ ] `/sign-in` renders with 3 OAuth buttons (Google, GitHub, Apple)
- [ ] `/api/auth/get-session` returns `null` for unauthenticated (200)
- [ ] `/api/auth/sign-out` POST clears session cookie

### Middleware Protection
- [ ] `/objects`, `/settings`, `/loans`, `/scan` → 307 redirect (unauthenticated)
- [ ] `/api/auth/*` and `/sign-in` → allowed

### tRPC Integration
- [ ] `GET /api/trpc/auth.me` returns `{ sessionToken: null, user: null }`
- [ ] `GET /api/trpc/health` returns `{ status: "ok" }`

### Manual Verification
```bash
curl -o /dev/null -w '%{http_code}' http://localhost:3000/collections  # expect 307
curl -o /dev/null -w '%{http_code}' http://localhost:3000/sign-in    # expect 200
curl http://localhost:3000/api/auth/get-session                      # expect null
curl http://localhost:3001/api/trpc/auth.me                          # expect {sessionToken:null, user:null}
curl http://localhost:3001/api/trpc/health                           # expect {status:"ok"}
```
