# S01: Password hashing on signup — UAT

**Milestone:** M003
**Written:** 2026-05-04T08:30:47.684Z

## UAT: M003 S01 — Password hashing

### Test 1: Sign-up crée Account.password hashé
```bash
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"uat-m003@brol.test","password":"UATPass99!","name":"UAT User"}'

# Vérifier en base:
psql -U postgres -d brol_test -c \
  "SELECT email, \"providerId\", password IS NOT NULL as hash_ok FROM accounts a JOIN users u ON u.id=a.\"userId\" WHERE u.email='uat-m003@brol.test';"
```
**Attendu:** `hash_ok = t`, `providerId = credential`

### Test 2: Sign-in avec password hashé
```bash
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"uat-m003@brol.test","password":"UATPass99!"}'
```
**Attendu:** `{"token":"..."}` — token non-nul

### Test 3: Sign-in avec mauvais password
```bash
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"uat-m003@brol.test","password":"wrongpassword"}'
```
**Attendu:** 401 UNAUTHORIZED
