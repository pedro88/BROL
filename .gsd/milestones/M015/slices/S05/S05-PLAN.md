# S05: Tab navigation shell (5 tabs)

**Goal:** Tab navigation shell avec les 5 tabs principaux + stub screens pour chaque tab
**Demo:** 5 tabs visibles: Home, Collections, Objects, Loans, Profile

## Must-Haves

- ## Success Criteria
- `app/_layout.tsx` root wrap avec TRPCProvider + QueryClient
- `app/(tabs)/_layout.tsx` définit les 5 tabs avec icons
- `app/(tabs)/index.tsx` → Dashboard (remplace l'ancien app/index.tsx)
- `app/(tabs)/collections.tsx` → Collections list
- `app/(tabs)/objects.tsx` → Objects list
- `app/(tabs)/loans.tsx` → Loans list
- `app/(tabs)/profile.tsx` → Settings/Profile
- Badge de notification sur l'onglet si applicable

## Proof Level

- This slice proves: Les 5 tabs sont cliquables et naviguent vers leur screen respectif

## Integration Closure

S05 est le shell visuel qui accueille le contenu de M016 et M017.

## Verification

- Aucune - structure de navigation pure

## Tasks

- [ ] **T01: Root layout avec auth-aware routing** `est:1h`
  Creer apps/mobile/app/_layout.tsx
  - Root layout (replaces existing app/_layout.tsx)
  - Wrap avec TRPCProvider (from trpc-provider.tsx)
  - Appele syncSession() au mount
  - Stack Navigator (pour sign-in/sign-up flows)
  - Si auth: render Tabs (qui sont dans (tabs)/_layout.tsx)
  - Si pas auth: render Stack with sign-in/sign-up screens
  - StatusBar dark
  - Files: `apps/mobile/app/_layout.tsx`
  - Verify: L'app render correctly sans crash

- [ ] **T02: Tab layout definition** `est:1h`
  Creer apps/mobile/app/(tabs)/_layout.tsx
  - Tab Navigator avec 5 tabs:
    1. Home (index) - icon: home
    2. Collections - icon: folder
    3. Objects - icon: box
    4. Loans - icon: arrow-left-right
    5. Profile - icon: user
  - Options: tabBarStyle avec theme dark, colors.primary pour actif
  - screenOptions: headerShown: false (géré par chaque screen)
  - Badge sur tab Profile si notifications non lues (plus tard, placeholder pour l'instant)
  - Files: `apps/mobile/app/(tabs)/_layout.tsx`
  - Verify: Les 5 tabs sont visibles et cliquables dans le simulator

- [ ] **T03: 5 stub tab screens** `est:1h`
  Creer les 5 stub screens dans (tabs)/:
  - index.tsx: Dashboard avec placeholder (stats mock)
  - collections.tsx: placeholder avec texte "Collections"
  - objects.tsx: placeholder avec texte "Objects"
  - loans.tsx: placeholder avec texte "Loans"
  - profile.tsx: placeholder avec texte "Profile" + bouton logout
  Chaque screen utilise le theme VHS et un SafeAreaView
  - Files: `apps/mobile/app/(tabs)/index.tsx`, `apps/mobile/app/(tabs)/collections.tsx`, `apps/mobile/app/(tabs)/objects.tsx`, `apps/mobile/app/(tabs)/loans.tsx`, `apps/mobile/app/(tabs)/profile.tsx`
  - Verify: Tous les tabs sont visibles et navigables

- [ ] **T04: Cleanup old screen files** `est:15min`
  Supprimer ou archiver les anciens fichiers:
  - apps/mobile/app/index.tsx (remplacé par (tabs)/index.tsx)
  - apps/mobile/app/collections.tsx (remplacé par (tabs)/collections.tsx)
  - apps/mobile/app/loans.tsx (remplacé par (tabs)/loans.tsx)
  - apps/mobile/app/scan.tsx (sera réactivé en M017 S01)
  Commit chaque fichier séparément
  - Files: `apps/mobile/app/index.tsx`, `apps/mobile/app/collections.tsx`, `apps/mobile/app/loans.tsx`
  - Verify: Les anciens fichiers sont supprimés ou archivés, l'app fonctionne toujours

## Files Likely Touched

- apps/mobile/app/_layout.tsx
- apps/mobile/app/(tabs)/_layout.tsx
- apps/mobile/app/(tabs)/index.tsx
- apps/mobile/app/(tabs)/collections.tsx
- apps/mobile/app/(tabs)/objects.tsx
- apps/mobile/app/(tabs)/loans.tsx
- apps/mobile/app/(tabs)/profile.tsx
- apps/mobile/app/index.tsx
- apps/mobile/app/collections.tsx
- apps/mobile/app/loans.tsx
