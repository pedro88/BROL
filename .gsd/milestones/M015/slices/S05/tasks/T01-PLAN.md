---
estimated_steps: 8
estimated_files: 1
skills_used: []
---

# T01: Root layout avec auth-aware routing

Creer apps/mobile/app/_layout.tsx
- Root layout (replaces existing app/_layout.tsx)
- Wrap avec TRPCProvider (from trpc-provider.tsx)
- Appele syncSession() au mount
- Stack Navigator (pour sign-in/sign-up flows)
- Si auth: render Tabs (qui sont dans (tabs)/_layout.tsx)
- Si pas auth: render Stack with sign-in/sign-up screens
- StatusBar dark

## Inputs

- `apps/mobile/src/lib/trpc-provider.tsx`
- `apps/mobile/src/lib/session-sync.ts`

## Expected Output

- `apps/mobile/app/_layout.tsx`

## Verification

L'app render correctly sans crash

## Observability Impact

Aucune - routing pure
