# S02: Supprimer les données mock du dashboard — UAT

**Milestone:** M005
**Written:** 2026-05-08T06:51:42.956Z

## UAT S02

### Test stats
1. Load dashboard as authenticated user
2. ✅ Stat "Objets" shows real count from summed collection objectCounts
3. ✅ Stat "Contacts" shows real count from contacts list length
4. ✅ Stat "Prêtés" shows real count from active loans length
5. ✅ No hardcoded numbers visible in DOM

### Test loans section
1. Dashboard displays active loan cards with object name and borrower
2. ✅ Empty state shown when no active loans

### Test loading state
1. During fetch, stat cards show "..." placeholder
2. ✅ Returns section shows "Chargement..." during fetch
