# M016: Core Mobile Features — Écrans fonctionnels avec données réelles

**Vision:** Porter tous les écrans principaux de la web app vers React Native avec données réelles via tRPC. Chaque écran fonctionne de bout en bout : lecture, création, modification. Le user peut naviguer, voir ses collections/objets/prêts, et interagir.

## Scope (inclus)
- **Collections**: liste, détail, création, édition, suppression
- **Objects**: liste (tous mes objets), ajout, détail, édition, suppression
- **Loans**: liste prêts actifs (donnés/empruntés), création, retour, historique
- **Contacts**: liste, détail, création
- **Dashboard/Home**: stats réelles (nb objets, prêts actifs, contacts)
- Photos sur objets (via photo picker, upload via API photos)
- Navigation depuis le dashboard vers les sections

## Scope (exclu)
- Scanner QR (→ M017)
- Notifications (→ M017)
- Settings / Profile / Tier (→ M017)
- Browse public (→ M017)
- Requests communautaire (→ M017)

## Dépendances
- M015 (Infrastructure) must complete first — this milestone consumes the tRPC client, auth state, and tab navigation established there

## Défis Known
- Photo upload : utiliser le endpoint `/api/photos/getPresignedUrl` + upload S3
- Formulaires : react-hook-form + zod (déjà dans les dépendances mobile)
- Object type-specific fields : le schéma objet de la web app supporte déjà les champs par type (vetement, outil, etc.)