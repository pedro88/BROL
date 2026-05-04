---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T03: Vérifier création Account avec password hashé

Signup via le client web, puis vérifier en base : 1) User créé, 2) Account créé avec password non-NULL et providerId='credential'.

## Inputs

- `auth-client.ts`

## Expected Output

- `Console: account.id exists, account.password is set`

## Verification

SELECT * FROM accounts WHERE password IS NOT NULL
