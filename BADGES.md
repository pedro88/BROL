# Brol Badge System — 100+ Badges with Custom SVG

> Comprehensive plan for the gamification system with retro-geek theme.

---

## Status

- [x] Design spec: `BADGE_DESIGN_SPEC.md`
- [x] UI/UX plan: `/tmp/badge-uiux-plan.md`
- [x] Backend refactor (Phase 1) — `badge-service.ts` (moteur de critères,
  `syncUserBadges` hooké dans les routers), notification `BADGE_UNLOCKED`
  à l'unlock, seed 109 définitions. Livré 2026-06-12.
- [x] SVG assets (Phase 2) — 120 SVG dans `apps/web/public/badges/`.
- [x] UI/UX implementation (Phase 3) — page `/badges` (filtres catégorie/
  rareté + progress), badges sur profil public, lien Trophy dans le header,
  notif cliquable → `/badges`.
- [ ] Reste : badges écrans mobile (M2+), cron pour conditions cumulatives
  si les hooks event-based ne suffisent pas (streaks, ancienneté).

---

## Catalog Overview

**108 badges** across 8 categories,5 rarity tiers.

### By Category

| Category | Slug prefix | Count | Rarity spread |
|----------|-----------|-------|---------------|
| Cinéma/VHS | `vhs-*`, `cinema-*`, `movie-*` | 15 | common → legendary |
| Littérature | `book-*`, `literary-*`, `bibliophile-*` | 15 | common → legendary |
| Jeux vidéo rétro | `gaming-*`, `retro-*`, `game-*` | 15 | common → legendary |
| TV/Séries | `tv-*`, `series-*`, `binge-*` | 12 | common → legendary |
| Hardware/Computing | `hardware-*`, `tech-*`, `tool-*` | 12 | common → legendary |
| Tabletop/RPG | `boardgame-*`, `tabletop-*`, `rpg-*` | 12 | common → legendary |
| Accomplissements | `lender-*`, `collector-*`, `reviewer-*` | 15 | common → epic |
| Spéciaux | `founding-*`, `unicorn-*`, `veteran-*` | 12 | rare → legendary |

### By Rarity

| Rarity | Count | Glow | Color |
|--------|-------|------|-------|
| common | ~25 | none | muted gray |
| uncommon | ~35 | subtle2px | teal `#00CCAA` |
| rare | ~30 | multi-layer | electric blue `#00BFFF` |
| epic | ~12 | complex | deep purple `#9933FF` |
| legendary | ~6 | animated rainbow | gold `#FFD700` |

---

## Full Badge Catalog

### 🎬 Cinéma/VHS (15)

| Slug | Name | Description | Rarity | Criteria |
|------|------|-------------|--------|----------|
| `vhs-pioneer` | Pionnier VHS | Premier film ajouté à la collection | common | `object_by_type: { threshold: 1, params: { objectType: "FILM" } }` |
| `vhs-collector` | Collecteur VHS | 10 films dans la collection | uncommon | `object_by_type: { threshold: 10, params: { objectType: "FILM" } }` |
| `vhs-maniac` | Maniaque du VHS | 50 films dans la collection | rare | `object_by_type: { threshold: 50, params: { objectType: "FILM" } }` |
| `vhs-temple` | Temple du cinéma | 100 films dans la collection | epic | `object_by_type: { threshold: 100, params: { objectType: "FILM" } }` |
| `director-collection` | Collection de réalisateur | 5 films du même réalisateur | rare | `object_by_type: { threshold: 5, params: { objectType: "FILM" } }` |
| `vhs-trilogy` | Trilogie complète | 3 films d'une même trilogie empruntés | uncommon | `loan_as_borrower_count: { threshold: 3 }` |
| `movie-buff` | Cinephile | 25 films empruntés au total | uncommon | `loan_as_borrower_count: { threshold: 25 }` |
| `genre-expert` | Expert du genre | 10 films d'un même genre | rare | `object_by_type: { threshold: 10, params: { objectType: "FILM" } }` |
| `retro-cinema` | Cinéma rétro | Un film de plus de 30 ans | common | `member_since_days: { threshold: 0, operator: "first" }` |
| `first-vhs` | Premier VHS | Premier objet ajouté (type film) | uncommon | `object_by_type: { threshold: 1, operator: "first" }` |
| `cinema-marathon` | Marathon cinématographique | 7 films empruntés en une semaine | epic | `loans_within_days: { threshold: 7, params: { days: 7 } }` |
| `director-chair` | Fauteuil du réalisateur | 10 objets FILM avec couverture | uncommon | `object_with_photos_count: { threshold: 10, params: { objectType: "FILM" } }` |
| `vhs-legend` | Légende VHS | 200 films dans la collection | legendary | `object_by_type: { threshold: 200, params: { objectType: "FILM" } }` |
| `cult-master` | Maître du cult | 5 films cultes ajoutés (avec notes) | rare | `object_with_isbn_count: { threshold: 5, params: { objectType: "FILM" } }` |
| `blockbuster-fan` | Fan de blockbuster | 10 films à succès ajoutés | common | `object_by_type: { threshold: 10, params: { objectType: "FILM" } }` |

### 📚 Littérature (15)

| Slug | Name | Description | Rarity | Criteria |
|------|------|-------------|--------|----------|
| `bibliophile` | Bibliophile | Premier livre ajouté | common | `object_by_type: { threshold: 1, params: { objectType: "BOOK" } }` |
| `bookworm` | Lecteur assidu | 10 livres dans la collection | uncommon | `object_by_type: { threshold: 10, params: { objectType: "BOOK" } }` |
| `library` | Petite bibliothèque | 25 livres dans la collection | uncommon | `object_by_type: { threshold: 25, params: { objectType: "BOOK" } }` |
| `grand-library` | Grande bibliothèque | 50 livres dans la collection | rare | `object_by_type: { threshold: 50, params: { objectType: "BOOK" } }` |
| `infinite-library` | Bibliothèque infinie | 100 livres dans la collection | epic | `object_by_type: { threshold: 100, params: { objectType: "BOOK" } }` |
| `first-novel` | Premier roman | Premier livre avec ISBN | common | `object_with_isbn_count: { threshold: 1, params: { objectType: "BOOK" } }` |
| `collector-series` | Collection de série | 5 livres d'une même série | uncommon | `object_by_type: { threshold: 5, params: { objectType: "BOOK" } }` |
| `comic-reader` | Lecteur de BD | 10 livres (bande dessinée) | uncommon | `object_by_type: { threshold: 10, params: { objectType: "BOOK" } }` |
| `manga-fan` | Fan de manga | 5 manga dans la collection | uncommon | `object_by_type: { threshold: 5, params: { objectType: "BOOK" } }` |
| `sci-fi-collection` | Collection SF | 10 livres de science-fiction | rare | `object_by_type: { threshold: 10, params: { objectType: "BOOK" } }` |
| `loan-archive` | Archives du prêt | 25 livres prêtés au total | uncommon | `loan_as_owner_count: { threshold: 25 }` |
| `borrowed-books` | Grand lecteur | 25 livres empruntés | uncommon | `loan_as_borrower_count: { threshold: 25 }` |
| `well-read` | Bien lu | 50 livres empruntés | rare | `loan_as_borrower_count: { threshold: 50 }` |
| `book-cave` | Caverne à livres | 200 livres dans la collection | legendary | `object_by_type: { threshold: 200, params: { objectType: "BOOK" } }` |
| `literary-critic` | Critique littéraire | 10 livres avec photos de couverture | rare | `object_with_photos_count: { threshold: 10, params: { objectType: "BOOK" } }` |

### 🎮 Jeux vidéo rétro (15)

| Slug | Name | Description | Rarity | Criteria |
|------|------|-------------|--------|----------|
| `first-game` | Premier jeu | Premier jeu vidéo ajouté | common | `object_count: { threshold: 1 }` |
| `gamer-collector` | Collectionneur gamer | 10 jeux vidéo | uncommon | `object_count: { threshold: 10 }` |
| `retro-master` | Maître du retro | 25 jeux vidéo | uncommon | `object_count: { threshold: 25 }` |
| `pixel-paradise` | Paradis du pixel | 50 jeux vidéo | rare | `object_count: { threshold: 50 }` |
| `nes-owner` | Propriétaire NES | 5 jeux NES | uncommon | `object_count: { threshold: 5 }` |
| `snes-owner` | Propriétaire SNES | 5 jeux SNES | uncommon | `object_count: { threshold: 5 }` |
| `gameboy-fan` | Fan Game Boy | 5 jeux Game Boy | uncommon | `object_count: { threshold: 5 }` |
| `sega-collector` | Collecteur Sega | 10 jeux Sega | rare | `object_count: { threshold: 10 }` |
| `complete-collection` | Collection complète | 10 consoles différentes | epic | `collection_count: { threshold: 10 }` |
| `gaming-legend` | Légende du gaming | 100 jeux vidéo | epic | `object_count: { threshold: 100 }` |
| `cartridge-hunter` | Chasseur de cartouches | 20 jeux sur cartouche | rare | `object_count: { threshold: 20 }` |
| `borrow-champion` | Champion d'emprunt | 50 jeux empruntés | rare | `loan_as_borrower_count: { threshold: 50 }` |
| `lending-gamer` | Gamer prêteur | 50 jeux prêtés | rare | `loan_as_owner_count: { threshold: 50 }` |
| `gaming-arcade` | Arcade gaming | 5 jeux avec caution (arcade) | uncommon | `object_with_caution_count: { threshold: 5 }` |
| `retro-pionnier` | Pionnier rétro | Premier utilisateur avec 10 jeux | legendary | `object_count: { threshold: 10, operator: "first" }` |

### 📺 TV/Séries (12)

| Slug | Name | Description | Rarity | Criteria |
|------|------|-------------|--------|----------|
| `tv-starter` | Débutant TV | Premier DVD/Blu-ray ajouté | common | `object_by_type: { threshold: 1, params: { objectType: "FILM" } }` |
| `series-collector` | Collecteur de séries | 10 saisons/épisodes | uncommon | `object_by_type: { threshold: 10, params: { objectType: "FILM" } }` |
| `binge-watcher` | Viewer compulsif | 25 DVDs/Blu-rays | uncommon | `object_by_type: { threshold: 25, params: { objectType: "FILM" } }` |
| `complete-series` | Série complète | 5 saisons d'une même série | rare | `object_by_type: { threshold: 5, params: { objectType: "FILM" } }` |
| `tv-marathon` | Marathon TV | 50 DVDs/Blu-rays | rare | `object_by_type: { threshold: 50, params: { objectType: "FILM" } }` |
| `sitcom-fan` | Fan de sitcom | 10 sitcoms dans la collection | uncommon | `object_by_type: { threshold: 10, params: { objectType: "FILM" } }` |
| `drama-king` | Roi du drama | 10 dramas dans la collection | uncommon | `object_by_type: { threshold: 10, params: { objectType: "FILM" } }` |
| `sci-fi-tv` | TV SF | 5 séries de science-fiction | uncommon | `object_by_type: { threshold: 5, params: { objectType: "FILM" } }` |
| `lent-series` | Séries prêtées | 25 séries prêtées | uncommon | `loan_as_owner_count: { threshold: 25 }` |
| `borrowed-seasons` | Saisons empruntées | 25 saisons empruntées | rare | `loan_as_borrower_count: { threshold: 25 }` |
| `collector-dvd` | Collectionneur DVD | 100 DVDs/Blu-rays | epic | `object_by_type: { threshold: 100, params: { objectType: "FILM" } }` |
| `tv-legend` | Légende TV | 200 DVDs/Blu-rays | legendary | `object_by_type: { threshold: 200, params: { objectType: "FILM" } }` |

### 💾 Hardware/Computing (12)

| Slug | Name | Description | Rarity | Criteria |
|------|------|-------------|--------|----------|
| `first-electronic` | Premier électronique | Premier appareil électronique | common | `object_by_type: { threshold: 1, params: { objectType: "ELECTRONIC" } }` |
| `gadget-collector` | Collectionneur de gadgets | 5 appareils électroniques | uncommon | `object_by_type: { threshold: 5, params: { objectType: "ELECTRONIC" } }` |
| `tech-enthusiast` | Enthousiaste tech | 10 appareils électroniques | rare | `object_by_type: { threshold: 10, params: { objectType: "ELECTRONIC" } }` |
| `toolshed` | Remise à outils | 5 outils ajoutés | common | `object_by_type: { threshold: 5, params: { objectType: "TOOL" } }` |
| `maker` | Bricoleur | 10 outils dans la collection | uncommon | `object_by_type: { threshold: 10, params: { objectType: "TOOL" } }` |
| `power-user` | Utilisateur power | 5 outils électriques | uncommon | `object_by_type: { threshold: 5, params: { objectType: "ELECTRIC" } }` |
| `workshop` | Atelier | 20 outils dans la collection | rare | `object_by_type: { threshold: 20, params: { objectType: "TOOL" } }` |
| `electronics-lab` | Labo électronique | 15 appareils avec photos | uncommon | `object_with_photos_count: { threshold: 15, params: { objectType: "ELECTRONIC" } }` |
| `manual-tools` | Outils manuels | 10 outils non électriques | uncommon | `object_by_type: { threshold: 10, params: { objectType: "TOOL" } }` |
| `battery-powered` | Sur batterie | 5 outils sur batterie | uncommon | `object_by_type: { threshold: 5, params: { objectType: "TOOL" } }` |
| `lending-tools` | Outils prêtés | 25 outils prêtés | uncommon | `loan_as_owner_count: { threshold: 25, params: { objectType: "TOOL" } }` |
| `borrow-electronics` | Appareils empruntés | 10 appareils électroniques empruntés | uncommon | `loan_as_borrower_count: { threshold: 10, params: { objectType: "ELECTRONIC" } }` |

### 🎲 Tabletop/RPG (12)

| Slug | Name | Description | Rarity | Criteria |
|------|------|-------------|--------|----------|
| `boardgame-starter` | Débutant jeu de société | Premier jeu de société | common | `object_by_type: { threshold: 1, params: { objectType: "BOARD_GAME" } }` |
| `boardgame-fan` | Fan de jeux de société | 5 jeux de société | uncommon | `object_by_type: { threshold: 5, params: { objectType: "BOARD_GAME" } }` |
| `boardgame-master` | Maître des jeux | 10 jeux de société | uncommon | `object_by_type: { threshold: 10, params: { objectType: "BOARD_GAME" } }` |
| `game-night` | Soirée jeux | 25 jeux de société | rare | `object_by_type: { threshold: 25, params: { objectType: "BOARD_GAME" } }` |
| `strategy-gamer` | Stratège | 5 jeux de stratégie | uncommon | `object_by_type: { threshold: 5, params: { objectType: "BOARD_GAME" } }` |
| `party-games` | Jeux de fête | 5 jeux de party | uncommon | `object_by_type: { threshold: 5, params: { objectType: "BOARD_GAME" } }` |
| `rpg-collector` | Collectionneur RPG | 3 livres/scénarios RPG | uncommon | `object_by_type: { threshold: 3, params: { objectType: "BOARD_GAME" } }` |
| `family-games` | Jeux en famille | 10 jeux pour tous publics | uncommon | `object_by_type: { threshold: 10, params: { objectType: "BOARD_GAME" } }` |
| `dice-collection` | Collection de dés | 5 sets de dés RPG | rare | `object_by_type: { threshold: 5, params: { objectType: "BOARD_GAME" } }` |
| `lent-games` | Jeux prêtés | 20 jeux de société prêtés | uncommon | `loan_as_owner_count: { threshold: 20, params: { objectType: "BOARD_GAME" } }` |
| `borrowed-games` | Jeux empruntés | 20 jeux de société empruntés | uncommon | `loan_as_borrower_count: { threshold: 20, params: { objectType: "BOARD_GAME" } }` |
| `tabletop-legend` | Légende tabletop | 50 jeux de société | epic | `object_by_type: { threshold: 50, params: { objectType: "BOARD_GAME" } }` |

### 🏆 Accomplissements (15)

| Slug | Name | Description | Rarity | Criteria |
|------|------|-------------|--------|----------|
| `first-loan` | Premier prêt | Votre premier prêt effectué | common | `loan_count: { threshold: 1 }` |
| `lender-5` | Prêteur confirmé | 5 prêts effectués | common | `loan_count: { threshold: 5 }` |
| `lender-25` | Prêteur expert | 25 prêts effectués | uncommon | `loan_count: { threshold: 25 }` |
| `lender-100` | Prêteur d'élite | 100 prêts effectués | rare | `loan_count: { threshold: 100 }` |
| `collector-10` | Collectionneur | 10 objets ajoutés | common | `object_count: { threshold: 10 }` |
| `collector-50` | Grand collectionneur | 50 objets ajoutés | uncommon | `object_count: { threshold: 50 }` |
| `collector-100` | Maître collectionneur | 100 objets ajoutés | rare | `object_count: { threshold: 100 }` |
| `collector-250` | Collectionneur expert | 250 objets ajoutés | epic | `object_count: { threshold: 250 }` |
| `reviewer` | Critique | Premier avis laissé | common | `review_count: { threshold: 1 }` |
| `critic-10` | Critique accompli | 10 avis laissés | uncommon | `review_count: { threshold: 10 }` |
| `five-stars` | Cinq étoiles | Note moyenne de 5 étoiles | rare | `avg_rating: { threshold: 5 }` |
| `four-stars` | Très bon | Note moyenne de 4+ étoiles | uncommon | `avg_rating: { threshold: 4 }` |
| `trusted-borrower` | Emprunteur fiable | 10 prêts retournés à temps | uncommon | `on_time_returns_count: { threshold: 10 }` |
| `reliable-lender` | Prêteur fiable | 25 prêts effectués | uncommon | `loan_as_owner_count: { threshold: 25 }` |
| `super-borrower` | Super emprunteur | 50 objets empruntés | rare | `loan_as_borrower_count: { threshold: 50 }` |

### 🌟 Spéciaux (12)

| Slug | Name | Description | Rarity | Criteria |
|------|------|-------------|--------|----------|
| `founding-member` | Membre fondateur | A rejoint Brol dès le début | legendary | `member_since_days: { threshold: 0, operator: "first" }` |
| `early-adopter` | Adopteur précoce | A rejoint dans les 30 premiers jours | epic | `member_since_days: { threshold: 30, operator: "<=" }` |
| `veteran` | Vétéran | Membre depuis plus d'un an | rare | `member_since_days: { threshold: 365, operator: ">=" }` |
| `century-club` | Club du siècle | 100 prêts au total | epic | `loan_count: { threshold: 100 }` |
| `variety-collection` | Collection variée | Au moins 5 types d'objets différents | uncommon | `has_all_object_types: { threshold: 5 }` |
| `social-butterfly` | Papillon social | 10 contacts enregistrés | uncommon | `contact_count: { threshold: 10 }` |
| `active-month` | Mois actif | Prêt ou emprunt ce mois-ci | common | `loans_this_month: { threshold: 1 }` |
| `streak-month` | Mois streak | 3 mois consécutifs avec prêt | rare | `loan_streak: { threshold: 3 }` |
| `qr-generator` | Générateur QR | 10 codes QR générés | uncommon | `qr_generated_count: { threshold: 10 }` |
| `message-sender` | Expéditeur | 10 messages envoyés | uncommon | `messages_sent_count: { threshold: 10 }` |
| `community-helper` | Aideur communautaire | 3 demandes de la communauté fulfill | rare | `requests_fulfilled_by_count: { threshold: 3 }` |
| `unicorn` | Licorne | A fulfill 10 demandes communautaires | epic | `requests_fulfilled_by_count: { threshold: 10 }` |

---

## New Criteria Types

### Loan Stats (8)
- `loan_as_owner_count` — loans where user is owner
- `loan_as_borrower_count` — loans where user is borrower
- `active_loans_count` — loans with status ACTIVE/OVERDUE
- `returned_loans_count` — loans with status RETURNED
- `overdue_loans_count` — loans with status OVERDUE
- `loans_within_days` — loans returned within X days
- `on_time_returns_count` — loans returned before due date
- `late_returns_count` — loans returned after due date

### Collection Stats (4)
- `collection_count` — total collections
- `public_collections_count` — collections where isPublic = true
- `collection_by_type` — collections by ObjectType
- `private_collections_count` — collections where isPublic = false

### Object Stats (6)
- `object_by_type` — objects by ObjectType (BOOK, BOARD_GAME, FILM...)
- `object_by_condition` — objects by ObjectCondition
- `object_with_photos_count` — objects that have photos
- `object_with_isbn_count` — objects with isbn set
- `object_with_caution_count` — objects with cautionAmount set
- `object_with_rental_count` — objects with rental price set

### Review Stats (6)
- `reviews_received_count` — reviews received (targetId = user)
- `reviews_with_comment_count` — reviews with comment
- `high_rating_received_count` — reviews received with rating >= 4
- `perfect_rating_count` — reviews received with rating = 5
- `reviews_given_with_comment` — reviews given with comment
- `reviews_given_count` — alias for review_count

### Contact Stats (4)
- `contact_count` — total contacts
- `contact_with_borrower_count` — contacts linked to a User
- `contact_added_this_month` — contacts created this month
- `contact_message_sent_count` — messages sent to contacts

### Engagement Stats (8)
- `messages_sent_count` — messages via QR scan
- `unread_messages_count` — unread messages
- `community_requests_count` — community requests authored
- `requests_fulfilled_count` — requests fulfilled (as author)
- `requests_fulfilled_by_count` — requests user helped fulfill
- `request_messages_count` — messages on requests
- `qr_generated_count` — QR codes generated
- `qr_used_count` — QR codes used

### Profile/Tier Stats (4)
- `tier_upgrades_count` — tier changes
- `profile_complete_percent` — profile completion %
- `has_avatar` — avatarUrl is set
- `has_bio` — bio is set

### Time-based Stats (6)
- `member_since_days` — days since createdAt
- `loans_this_month` — loans in current month
- `objects_added_this_month` — objects this month
- `reviews_this_month` — reviews this month
- `loan_streak` — consecutive months with loan
- `borrowing_streak` — consecutive months with borrow

### Special/Complex (5)
- `returned_count` — total returned
- `has_all_object_types` — has object of each type
- `borrowed_from_count` — unique owners borrowed from
- `lent_to_count` — unique borrowers lent to
- `categories_represented` — distinct categories with objects

### Operators
- `">="` — default, greater than or equal
- `"=="` — exact match
- `">"` — greater than
- `"<"` — less than
- `"!="` — not equal
- `"first"` — must be first to achieve
- `"streak"` — consecutive periods
- `"between"` — value in range
- `"contains"` — string contains substring

---

## SVG Design Spec

### Standard
- **viewBox**: 64×64
- **Stroke**: 2px base
- **Format**: SVG 1.1, no external dependencies

### Color Palette
- Primary: Magenta `#FF00FF`
- Secondary: Neon Cyan `#00FFFF`
- Accent: CRT Amber `#FFBF00`
- Background: Dark `#0a0a0a`
- Text: White `#FFFFFF`

### Per-Category Visual Rules
| Category | Theme | Elements |
|----------|-------|----------|
| Cinéma/VHS | VHS aesthetic | VHS tapes, film reels, clapperboards |
| Littérature | Book aesthetic | Book spines, typewriters, quills |
| Jeux vidéo rétro | Pixel art | NES controllers, cartridges, arcade cabinets |
| TV/Séries | Retro TV | Old TV sets, antennas, remotes |
| Hardware/Computing | Circuit aesthetic | Floppy disks, CPUs, circuit boards |
| Tabletop/RPG | Tabletop | Dice (d6-d20), meeples, scrolls |
| Accomplissements | Trophy | Trophies, medals, crowns, laurels |
| Spéciaux | Unique | Lightning, crystals, rainbows, infinity |

### Rarity Visual Tiers
| Rarity | Color | Glow | Effect |
|--------|-------|------|--------|
| common | muted gray `#888888` | none | flat |
| uncommon | teal `#00CCAA` | subtle 2px | simple |
| rare | electric blue `#00BFFF` | multi-layer | animated-ready |
| epic | deep purple `#9933FF` | complex | particle-ready |
| legendary | gold `#FFD700` | rainbow shimmer | pulsing |

### Directory Structure
```
apps/web/public/badges/
  cinema/
    vhs-tape-common.svg
    vhs-collector-uncommon.svg
    ...
  literature/
  gaming/
  television/
  hardware/
  tabletop/
  accomplishments/
  special/
```

### Naming Convention
`{category}-{subcategory}-{rarity}.svg`

Example: `cinema-vhs-tape-common.svg`, `gaming-nes-controller-uncommon.svg`

---

## Schema Changes

### BadgeDefinition additions
```prisma
model BadgeDefinition {
  // ... existing fields ...
  rarity String  @default("COMMON")  // COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
  category   String  @default("MILESTONE") // CINEMA, LITERATURE, GAMING, TV, HARDWARE, TABLETOP, ACCOMPLISHMENTS, SPECIAL
  unlockHint String? // Hint shown on locked badges
  svgAsset   String? // Path to SVG asset relative to /public/badges/
}
```

### Optional: Login Activity Table (for streak tracking)
```prisma
model UserActivity {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @db.Date
  createdAt DateTime @default(now())

  @@unique([userId, date])
  @@index([userId, date])
}
```

---

## Implementation Phases

### Phase 1 — Backend Core
1. Refactor `badge-service.ts` with handler pattern + strategy map
2. Add50+ new criteria handlers
3. Add stats caching with 60s TTL
4. Schema migration: add `rarity`, `category`, `unlockHint`, `svgAsset`
5. Seed108 badges with helper functions per category
6. Add `syncUserBadges` calls to relevant routers (contacts, photos, community-request, messages)

### Phase 2 — SVG Assets
1. Create 108 SVG files in `/apps/web/public/badges/{category}/`
2. Follow pixel art spec (64×64 viewBox, 2px stroke)
3. 5 rarity tiers with distinct glow levels
4. Create `BadgeIcon` component with fallback (emoji → SVG)

### Phase 3 — UI/UX Display
1. Profile page: replace emoji with `BadgeIcon`, progress ring, rarity display
2. `/badges` page: category tabs, rarity filter, progress bars, locked hint
3. `BadgeModal` component for detail view
4. Enhanced `BadgeNotification` with SVG preview + unlock animation
5. Animations: rarity glow, unlock bounce, hover effects

---

## Files to Modify

### Phase 1
| File | Changes |
|------|---------|
| `packages/api/src/lib/badge-service.ts` | Complete rewrite, handler pattern, stats cache |
| `packages/api/src/routers/badge.ts` | Update syncUser, add new procedures |
| `packages/db/prisma/schema.prisma` | Add rarity/category/unlockHint/svgAsset |
| `packages/db/prisma/seed.ts` | Expand to 108 badges with helper functions |
| `packages/api/src/routers/contacts.ts` | Add syncUserBadges call |
| `packages/api/src/routers/photos.ts` | Add syncUserBadges call |
| `packages/api/src/routers/community-request.ts` | Add syncUserBadges call |
| `packages/api/src/routers/messages.ts` | Add syncUserBadges call |

### Phase 2
| File | Changes |
|------|---------|
| `apps/web/public/badges/` |108 SVG files |
| `apps/web/src/components/badges/badge-icon.tsx` | New component |
| `packages/shared/src/schemas/` | Add BadgeRarity enum if needed |

### Phase 3
| File | Changes |
|------|---------|
| `apps/web/src/app/profile/[id]/page.tsx` | BadgeIcon, progress ring, modal |
| `apps/web/src/app/badges/page.tsx` | Category tabs, rarity filter, progress |
| `apps/web/src/components/badges/badge-card.tsx` | New component |
| `apps/web/src/components/badges/badge-modal.tsx` | New component |
| `apps/web/src/components/badges/badge-notification.tsx` | New component |
| `packages/api/src/lib/badge-service.ts` | BadgeNotification with SVG metadata |
| `packages/shared/src/i18n/index.ts` | Add badge-related translations |

---

## References
- Design spec: `BADGE_DESIGN_SPEC.md`
- UI/UX plan: `/tmp/badge-uiux-plan.md`
- Badge service: `packages/api/src/lib/badge-service.ts`
- Badge router: `packages/api/src/routers/badge.ts`
- Schema: `packages/db/prisma/schema.prisma`
- Seed: `packages/db/prisma/seed.ts`
