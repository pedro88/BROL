---
estimated_steps: 10
estimated_files: 1
skills_used: []
---

# T02: Tab layout definition

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

## Inputs

- None specified.

## Expected Output

- `apps/mobile/app/(tabs)/_layout.tsx`

## Verification

Les 5 tabs sont visibles et cliquables dans le simulator

## Observability Impact

Aucune - navigation pure
