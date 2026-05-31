# BROL — Structure de base de données

> Référence du schéma Postgres généré par Prisma.
> Source de vérité : [`packages/db/prisma/schema.prisma`](packages/db/prisma/schema.prisma).
> Dernière mise à jour : 2026-05-31 (post-sprint community-request).

---

## TL;DR

- **PostgreSQL 16** (`brol` en prod, `brol_test` pour vitest).
- **18 modèles**, **8 enums**, **10 migrations versionnées**.
- IDs : `String @id @default(cuid())` partout, sauf clé composite
  `VerificationToken (identifier, value)`.
- Toutes les dates : `DateTime` (UTC). `createdAt` / `updatedAt`
  conventions.
- Cascades : la plupart des relations enfant utilisent
  `onDelete: Cascade`. Exception : `Loan.borrower → User` (set null
  via Contact si compte parti) ; `CommunityRequest.fulfillBy → Self`
  utilise `SetNull`.

---

## Vue d'ensemble par domaine

```
┌────────────────────────┐     ┌──────────────────────────┐
│ AUTH / USER            │     │ COLLECTIONS / OBJECTS    │
│ User                   │◀────│ Collection ─▶ Object     │
│ Account                │     │            ↘ Photo       │
│ Session                │     │            ↘ QrStock     │
│ VerificationToken      │     └──────────────────────────┘
└────────────────────────┘                  │
            │                               │
            │              ┌────────────────┴──────────┐
            ▼              │ LOANS / CONTACTS          │
  ┌────────────────┐       │ Loan ─▶ Object + User     │
  │ Profile        │       │ Contact ─▶ User (opt.)    │
  │ UserBadge ─▶ Badge     │ Review ─▶ Loan + User×2   │
  └────────────────┘       └───────────────────────────┘
            │
            ▼
  ┌──────────────────────────────────────────┐
  │ COMMUNITY                                │
  │ CommunityRequest                         │
  │     └─▶ RequestMessage (thread in-app)   │
  └──────────────────────────────────────────┘
            │
            ▼
  ┌──────────────────────────────────────────┐
  │ NOTIFICATIONS / MESSAGES                 │
  │ Notification (Bell badge feed)           │
  │ Message (contact depuis scan QR public)  │
  └──────────────────────────────────────────┘
```

---

## 1. Auth / User

### `User` — `users`

Le hub central. Toutes les autres tables référencent un user.

| Champ            | Type        | Nullable | Default          | Description |
| ---------------- | ----------- | :------: | :--------------: | ----------- |
| `id`             | String      |          | cuid             | PK |
| `handle`         | String      |    ✓     |                  | Pseudo public unique (ex: `piet1234`). **Immuable post-signup** depuis 2026-05-31. |
| `email`          | String      |          |                  | Unique. |
| `name`           | String      |    ✓     |                  | Nom affiché. |
| `image`          | String      |    ✓     |                  | URL avatar (BetterAuth: `avatarUrl → image`). |
| `locale`         | String      |          | `"fr"`           | `fr` / `nl` / `en`. |
| `country`        | String      |    ✓     |                  | ISO-3166 alpha-2. Localisation (sprint 2026-05-31). |
| `postalCode`     | String      |    ✓     |                  | CP utilisateur. |
| `city`           | String      |    ✓     |                  | Hydraté depuis Zippopotam au save. |
| `lat`            | Float       |    ✓     |                  | Cache geocoding (Haversine matching). |
| `lng`            | Float       |    ✓     |                  | Idem. |
| `emailVerified`  | Boolean     |          | `false`          | BetterAuth. |
| `createdAt`      | DateTime    |          | `now()`          | |
| `updatedAt`      | DateTime    |          | `@updatedAt`     | |

**Relations** :
- `accounts`, `sessions` — auth BetterAuth.
- `collections`, `qrStocks`, `profile` — propriétés du user.
- `ownerOf` / `borrowerOf` (`Loan`) — prêts dans les 2 sens.
- `contacts` (`UserContacts`) — répertoire perso.
- `borrowerOfContact` (`ContactBorrower`) — contacts d'autres qui pointent vers moi.
- `authorReviews` / `targetReviews` — reviews écrits et reçus.
- `userBadges` — badges débloqués.
- `communityRequests`, `notifications`, `messages`.
- `requestMessagesSent` / `requestMessagesReceived` — thread in-app community.

**Index** : `(country, postalCode)` pour les lookups de matching.

---

### `Account` — `accounts`

Provider auth BetterAuth (1 ligne par méthode de login).

| Champ                    | Type     | Nullable | Description |
| ------------------------ | -------- | :------: | ----------- |
| `id`                     | String   |          | PK cuid |
| `userId`                 | String   |          | FK → User (cascade) |
| `providerId`             | String   |          | `"credential"` pour email/password |
| `accountId`              | String   |          | ID unique par provider |
| `password`               | String   |    ✓     | bcrypt hash si credential |
| `accessToken`            | String   |    ✓     | OAuth |
| `refreshToken`           | String   |    ✓     | OAuth |
| `idToken`                | String   |    ✓     | OAuth |
| `accessTokenExpiresAt`   | DateTime |    ✓     | |
| `refreshTokenExpiresAt`  | DateTime |    ✓     | |
| `scope`                  | String   |    ✓     | |

**Contrainte** : `@@unique([providerId, accountId])`.

---

### `Session` — `sessions`

| Champ        | Type     | Description |
| ------------ | -------- | ----------- |
| `id`         | String   | PK cuid |
| `token`      | String   | Unique (cookie value) |
| `userId`     | String   | FK → User (cascade) |
| `expiresAt`  | DateTime | TTL |
| `ipAddress`  | String?  | |
| `userAgent`  | String?  | |

---

### `VerificationToken` — `verification_tokens`

| Champ         | Type     | Description |
| ------------- | -------- | ----------- |
| `identifier`  | String   | Email (en général) |
| `value`       | String   | Unique (token) |
| `expiresAt`   | DateTime | |

**Clé** : composite `@@unique([identifier, value])` (pas de PK simple).

---

## 2. Collections / Objects

### `Collection` — `collections`

Conteneur d'objets, typé par `ObjectType`.

| Champ                | Type        | Default               | Description |
| -------------------- | ----------- | --------------------- | ----------- |
| `id`                 | String      | cuid                  | PK |
| `userId`             | String      |                       | FK → User (cascade) |
| `name`               | String      |                       | |
| `description`        | String?     |                       | |
| `coverImage`         | String?     |                       | URL S3 ou DiceBear |
| `isPublic`           | Boolean     | `false`               | Si true, visible sur `/browse` |
| `type`               | ObjectType? | `BOOK`                | Détermine champs pertinents de Object |
| `customField1Label`  | String?     | `"Champ libre 1"`     | Label si `type=CUSTOM` |
| `customField2Label`  | String?     | `"Champ libre 2"`     | Idem |

**Index** : `userId`, `isPublic`.

---

### `Object` — `objects`

L'objet emprunté/prêté. Polymorphe via `objectType` — beaucoup de champs nullable selon le type.

| Champ                  | Type             | Description |
| ---------------------- | ---------------- | ----------- |
| `id`                   | String           | PK cuid |
| `collectionId`         | String           | FK → Collection (cascade) |
| `name`                 | String           | Nom obligatoire |
| `author`               | String?          | Auteur (livres, films, jeux, musique) |
| `edition`              | String?          | Édition (livres, films) |
| `isbn`                 | String?          | Livres — indexé pour ImportFromISBN |
| `barcode`              | String?          | Code-barres physique |
| `condition`            | ObjectCondition  | NEW / LIKE_NEW / GOOD / FAIR / POOR |
| `notes`                | String?          | |
| `coverImage`           | String?          | Photo principale (URL S3) |
| `objectType`           | ObjectType?      | Default `BOOK`. Mirrors collection.type |
| **BOARD_GAME**         |                  | |
| `playersMin/Max`       | Int?             | |
| `playingTimeMinutes`   | Int?             | |
| `ageMin`               | Int?             | |
| **ELECTRIC**           |                  | |
| `powerWatts`           | Int?             | |
| **CLOTHING**           |                  | |
| `clothingSize`         | String?          | XS/S/M/L/XL/40… |
| `clothingGender`       | String?          | H / F / Unisexe / Enfant |
| `clothingColor`        | String?          | |
| `clothingMaterial`     | String?          | |
| **TOOL**               |                  | |
| `toolManual` (deprec)  | Boolean?         | Remplacé par `toolPowerSource` |
| `toolBattery` (deprec) | Boolean?         | Idem |
| `toolPowerSource`      | ToolPowerSource? | MANUAL / MAINS / BATTERY |
| `toolSector`           | String?          | Construction, jardinage, automobile |
| **Partagé TOOL/CLOTH** |                  | |
| `brand`                | String?          | Marque |
| **CUSTOM**             |                  | |
| `customField1/2`       | String?          | Libre, label dans Collection |
| **Caution + tarifs**   |                  | |
| `cautionAmount`        | Decimal(10,2)?   | Caution |
| `rentalPriceDay/Hour/Week/Km` | Decimal(10,2)? | Tarifs location |
| `qrStockId`            | String?          | FK unique → QrStock (1-1) |

**Relations** : `collection`, `loans`, `qrStock`, `photos`, `messages`.

**Index** : `collectionId`, `isbn`.

---

### `Photo` — `photos`

| Champ        | Type    | Description |
| ------------ | ------- | ----------- |
| `id`         | String  | PK cuid |
| `objectId`   | String  | FK → Object (cascade) |
| `url`        | String  | URL S3 |
| `position`   | Int     | Default 0 — ordre d'affichage |

**Index** : `objectId`, `(objectId, position)`.

---

### Enums

```
enum ObjectType {
  BOOK BOARD_GAME TOOL FILM MUSIC ELECTRONIC ELECTRIC CLOTHING CUSTOM
}

enum ToolPowerSource {
  MANUAL MAINS BATTERY
}

enum ObjectCondition {
  NEW LIKE_NEW GOOD FAIR POOR
}
```

---

## 3. Contacts

### `Contact` — `contacts`

Répertoire personnel. Un contact peut être un user Brol (via `borrowerId`) ou un simple lead externe.

| Champ         | Type    | Description |
| ------------- | ------- | ----------- |
| `id`          | String  | PK cuid |
| `userId`      | String  | FK → User (`UserContacts`, cascade) — propriétaire du contact |
| `name`        | String  | |
| `email`       | String? | |
| `phone`       | String? | |
| `note`        | String? | |
| `borrowerId`  | String? | FK → User (`ContactBorrower`) si le contact a un compte Brol |

**Relations** :
- `loansAsBorrowerContact` (`LoanBorrowerContact`) — prêts vers ce contact non-Brol.

**Index** : `userId`, `email`, `borrowerId`.

---

## 4. Loans

### `Loan` — `loans`

Un prêt actif ou clos. Le borrower est soit un user Brol (`borrowerId`), soit un contact non-Brol (`borrowerContactId`).

| Champ                | Type        | Default     | Description |
| -------------------- | ----------- | ----------- | ----------- |
| `id`                 | String      | cuid        | PK |
| `objectId`           | String      |             | FK → Object (cascade) |
| `ownerId`            | String      |             | FK → User `Owner` (cascade) |
| `borrowerId`         | String?     |             | FK → User `Borrower` si Brol |
| `borrowerContactId`  | String?     |             | FK → Contact `LoanBorrowerContact` si non-Brol |
| `status`             | LoanStatus  | `ACTIVE`    | ACTIVE / RETURNED / OVERDUE / CANCELLED |
| `lentAt`             | DateTime    | `now()`     | |
| `returnDueDate`      | DateTime?   |             | Optionnel — sans deadline si null |
| `returnedAt`         | DateTime?   |             | Non-null quand RETURNED |
| `reminderSentAt`     | DateTime?   |             | Audit d'envoi de rappel |
| `notes`              | String?     |             | |

**Index** : `objectId`, `borrowerId`, `borrowerContactId`, `ownerId`, `status`, `returnDueDate`.

```
enum LoanStatus { ACTIVE RETURNED OVERDUE CANCELLED }
```

---

## 5. Profile + Tier

### `Profile` — `profiles`

Données complémentaires user (1-1 avec User). Tous les champs perso sont **opt-in** : retournés à null par `profile.get` à un viewer anonyme sauf si le toggle `publicXxx` correspondant est `true`.

| Champ              | Type      | Default | Description |
| ------------------ | --------- | ------- | ----------- |
| `id`               | String    | cuid    | PK |
| `userId`           | String    |         | FK unique → User (cascade) |
| `bio`              | String?   |         | Bio publique |
| `avatarUrl`        | String?   |         | Override `User.image` |
| `tier`             | UserTier  | `FREE`  | FREE / TIER_2 / TIER_3 |
| `tierExpiresAt`    | DateTime? |         | Null = jamais |
| `birthYear`        | Int?      |         | Année de naissance (préféré à age) |
| `gender`           | String?   |         | `M` / `F` / `X` / libre |
| `phone`            | String?   |         | E.164 ou libre |
| `publicEmail`      | Boolean   | `false` | Exposer email sur profil public |
| `publicPhone`      | Boolean   | `false` | |
| `publicBirthYear`  | Boolean   | `false` | |
| `publicGender`     | Boolean   | `false` | |
| `publicCity`       | Boolean   | `true`  | Ville visible par défaut (déjà utilisée pour matching) |

```
enum UserTier {
  FREE   // 5 collections, 50 objets, 10 prêts
  TIER_2 // 10 / 500 / 50 — 3€/mois
  TIER_3 // illimité — 20€/mois
}
```

---

## 6. Reviews + Badges

### `Review` — `reviews`

Note + commentaire entre 2 users après un prêt. **1 review par auteur par prêt** maximum.

| Champ      | Type     | Description |
| ---------- | -------- | ----------- |
| `id`       | String   | PK cuid |
| `authorId` | String   | FK → User `ReviewAuthor` (cascade) |
| `targetId` | String   | FK → User `ReviewTarget` (cascade) |
| `loanId`   | String   | FK → Loan `ReviewLoan` (cascade) — review obligatoirement lié à un échange |
| `rating`   | Int      | 1-5 étoiles |
| `comment`  | String?  | |

**Contrainte** : `@@unique([authorId, loanId])` — pas de double-review.

**Index** : `targetId`.

---

### `BadgeDefinition` — `badge_definitions`

Catalogue des badges disponibles.

| Champ          | Type    | Description |
| -------------- | ------- | ----------- |
| `id`           | String  | PK cuid |
| `slug`         | String  | Unique — `"first_loan"`, `"10_loans"`, etc. |
| `name`         | String  | Nom affiché |
| `description`  | String  | |
| `icon`         | String  | Emoji ou URL |
| `criteria`     | Json    | Règle automatique (ex: `{ type: "loan_count", threshold: 10 }`) |

---

### `UserBadge` — `user_badges`

Badges débloqués par un user.

| Champ        | Type     | Description |
| ------------ | -------- | ----------- |
| `id`         | String   | PK cuid |
| `userId`     | String   | FK → User (cascade) |
| `badgeId`    | String   | FK → BadgeDefinition (cascade) |
| `awardedAt`  | DateTime | |

**Contrainte** : `@@unique([userId, badgeId])`. **Index** : `userId`.

---

## 7. Community Requests (sprint 2026-05-31)

### `CommunityRequest` — `community_requests`

Demande "à la communauté" pour trouver un objet absent du catalogue.

| Champ                | Type           | Default | Description |
| -------------------- | -------------- | ------- | ----------- |
| `id`                 | String         | cuid    | PK |
| `authorId`           | String         |         | FK → User (cascade) |
| `title`              | String         |         | Ex: "scie à onglet", "À la recherche du temps perdu" |
| `description`        | String?        |         | Détails |
| `zone`               | String?        |         | Dérivé : `${city} (${postalCode})` au save |
| `status`             | RequestStatus  | `OPEN`  | OPEN / FULFILLED / CANCELLED / EXPIRED |
| `fulfillByRequestId` | String?        |         | Self-FK `RequestFulfillment` (SetNull) si une autre demande a fulfill celle-ci |
| `expiresAt`          | DateTime?      |         | |

**Index** : `authorId`, `status`.

```
enum RequestStatus { OPEN FULFILLED CANCELLED EXPIRED }
```

---

### `RequestMessage` — `request_messages`

Thread in-app **scopé à une CommunityRequest** (pas d'inbox globale).

| Champ        | Type     | Default | Description |
| ------------ | -------- | ------- | ----------- |
| `id`         | String   | cuid    | PK |
| `requestId`  | String   |         | FK → CommunityRequest (cascade) |
| `fromUserId` | String   |         | FK → User `RequestMessageSent` (cascade) |
| `toUserId`   | String   |         | FK → User `RequestMessageReceived` (cascade) |
| `content`    | String   |         | Max 500 chars (zod) |
| `isRead`     | Boolean  | `false` | Auto-mark à la lecture par recipient |

**Index** : `requestId`, `(toUserId, isRead)` pour le compteur unread.

**Règles de routage** (côté router) :
- Premier message dans un thread = caller ≠ author → recipient = author.
- Réponse de l'author = recipient = dernier sender autre que author.
- L'author ne peut pas amorcer le thread (BAD_REQUEST).

---

## 8. Notifications

### `Notification` — `notifications`

Feed personnel (Bell badge). Polling 30s côté frontend.

| Champ          | Type              | Description |
| -------------- | ----------------- | ----------- |
| `id`           | String            | PK cuid |
| `userId`       | String            | FK → User (cascade) — destinataire |
| `type`         | NotificationType  | Catégorie |
| `title`        | String            | Affiché en gras |
| `message`      | String?           | Détails (preview 120 chars pour les messages) |
| `isRead`       | Boolean           | Default false |
| `relatedId`    | String?           | ID de la ressource liée |
| `relatedType`  | String?           | `"loan"` / `"request"` / `"review"` — détermine l'URL de redirect au click |
| `emailSentAt`  | DateTime?         | Audit d'envoi Resend |

**Index** : `userId`, `(userId, isRead)`.

```
enum NotificationType {
  RETURN_REMINDER     // Rappel de retour
  OVERDUE             // Retour en retard
  COMMUNITY_REQUEST   // Matching + nouveau message in-app
  REVIEW_RECEIVED     // Commentaire/note reçu
  REQUEST_FULFILLED   // Votre demande a été traitée
}
```

---

## 9. QR Stock

### `QrStock` — `qr_stocks`

Pool de QR codes pré-générés par user, à assigner à des objets.

| Champ       | Type     | Default | Description |
| ----------- | -------- | ------- | ----------- |
| `id`        | String   | cuid    | PK |
| `userId`    | String   |         | FK → User (cascade) |
| `code`      | String   |         | UUID v7 (unique) — ordering préservé |
| `used`      | Boolean  | `false` | Passe à true quand assigné à un Object |
| `usedAt`    | DateTime?|         | |

**Relations** : `objects` (1 QR code peut théoriquement référer plusieurs objets via `Object.qrStockId`, mais en pratique c'est 1-1 via `@unique` sur Object).

**Index** : `userId`, `code`.

---

## 10. Messages (scan QR public)

### `Message` — `messages`

⚠️ Ne pas confondre avec `RequestMessage`. Ce modèle gère le **contact anonyme depuis un scan QR public** (le scanner n'est pas authentifié).

| Champ       | Type     | Description |
| ----------- | -------- | ----------- |
| `id`        | String   | PK cuid |
| `objectId`  | String   | FK → Object (cascade) |
| `ownerId`   | String   | FK → User (cascade) — propriétaire de l'objet |
| `fromName`  | String   | Nom saisi par le scanner anonyme |
| `fromEmail` | String   | Email de réponse |
| `content`   | String   | Max 500 chars |
| `read`      | Boolean  | Default false |

**Index** : `ownerId`, `objectId`, `createdAt`.

---

## Cardinality cheat-sheet

```
User 1 ─┬─ * Collection 1 ─ * Object 1 ─ * Photo
        │                          │
        │                          └─ 0..1 QrStock
        │
        ├─ * Contact 0..1 ─ User           (lien Brol optionnel)
        │
        ├─ * Loan (as Owner)
        │       Loan 1 ─ Object
        │       Loan 1 ─ User (Borrower) OR Contact (BorrowerContact)
        │       Loan 1 ─ * Review
        │
        ├─ 0..1 Profile
        ├─ * UserBadge * ─ BadgeDefinition
        │
        ├─ * CommunityRequest 1 ─ * RequestMessage * ─ 2 User
        │
        ├─ * Notification
        ├─ * Message (in-bound depuis QR scan)
        └─ * RequestMessage (sent + received)
```

---

## Migrations versionnées

Dossier `packages/db/prisma/migrations/` — `prisma migrate deploy` en
dev + prod.

| Migration                                              | Date       | Contenu |
| ------------------------------------------------------ | ---------- | ------- |
| `20260511072136_init_object_types`                     | 2026-05-11 | Schéma initial + types objets |
| `20260511120000_add_photos`                            | 2026-05-11 | Modèle Photo |
| `20260522060000_add_social_and_rental_fields`          | 2026-05-22 | Reviews, badges, tarifs location |
| `20260529160000_add_handle_and_messages`               | 2026-05-29 | User.handle + Message (scan QR) |
| `20260530100000_add_brand_and_tool_power_source`       | 2026-05-30 | Object.brand + ToolPowerSource enum |
| `20260530120000_add_user_location_and_postal_codes`    | 2026-05-30 | User.country/postalCode/city/lat/lng + (table PostalCode finalement supprimée) |
| `20260531000000_remove_postal_codes_table`             | 2026-05-31 | Drop PostalCode (pivot vers API Zippopotam) |
| `20260531100000_add_request_messages`                  | 2026-05-31 | Modèle RequestMessage (thread in-app community) |
| `20260531110000_profile_personal_info`                 | 2026-05-31 | Profile : birthYear/gender/phone + toggles publicXxx |

---

## Conventions

- **CUID** comme PK (`String @id @default(cuid())`) — ordering temporel garanti, URL-safe, plus court qu'un UUID.
- **camelCase** dans Prisma, **camelCase** dans la table aussi (`@@map("users")` ne renomme que la table).
- **`onDelete: Cascade`** par défaut sur les relations enfant. Exception : `Contact.borrower → User` (`Restrict` implicite — un user lié comme borrower ne peut pas être supprimé sans cleanup).
- **Décimaux** : `Decimal @db.Decimal(10, 2)` pour les montants (`cautionAmount`, `rentalPriceXxx`).
- **Géocoding** : `lat/lng` en `Float` (PostgreSQL `DOUBLE PRECISION`). Précision suffisante (~11 cm) pour le matching radius. Pas de PostGIS.

---

## Commandes utiles

```bash
# Inspecter le schema en live
PGPASSWORD=password psql -h localhost -U postgres -d brol -c "\dt"

# Lister les colonnes d'une table
PGPASSWORD=password psql -h localhost -U postgres -d brol -c "\d+ users"

# Générer le client Prisma après changement de schema
pnpm --filter @brol/db exec prisma generate

# Créer une migration depuis un changement de schema
pnpm --filter @brol/db exec prisma migrate dev --name your_change_name

# Appliquer les migrations en prod (ou dev sans création)
pnpm --filter @brol/db exec prisma migrate deploy

# Status des migrations
pnpm --filter @brol/db exec prisma migrate status

# Backup avant migration risquée
bash scripts/db-backup.sh
```
