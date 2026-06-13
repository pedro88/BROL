/**
 * Définitions des badges — source de vérité unique, sans effet de bord.
 * Consommé par le seed (`prisma/seed.ts`) ET par les tests (via @brol/db).
 * @package @brol/db
 */

import { type Prisma } from "@prisma/client";

export type BadgeRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
// TV fusionné dans CINEMA (2026-06-13) — les DVD/Blu-ray/séries sont des FILM.
export type BadgeCategory = "CINEMA" | "LITERATURE" | "GAMING" | "HARDWARE" | "TABLETOP" | "ACCOMPLISHMENTS" | "SPECIAL";

export interface BadgeDef {
  slug: string;
  name: string;
  description: string;
  icon: string;
  criteria: Prisma.InputJsonValue;
  rarity: BadgeRarity;
  category: BadgeCategory;
}

// ===========================================
// CINEMA BADGES (FILM) — absorbe l'ancienne catégorie TV.
// Chaque critère reflète exactement la description : paliers de collection à
// seuils distincts, "même saga/série" (object_max_by_field series), genre
// précis (object_by_genre_value), prêts/emprunts filtrés par type FILM.
// ===========================================

const cinemaBadges: BadgeDef[] = [
  // Paliers de collection (object_by_type FILM) — seuils distincts.
  { slug: "vhs-pioneer", name: "Pionnier VHS", description: "Premier film ajouté", icon: "📼", rarity: "COMMON", category: "CINEMA", criteria: { type: "object_by_type", threshold: 1, params: { objectType: "FILM" } } },
  { slug: "first-vhs", name: "Premier VHS", description: "3 films dans la collection", icon: "📼", rarity: "UNCOMMON", category: "CINEMA", criteria: { type: "object_by_type", threshold: 3, params: { objectType: "FILM" } } },
  { slug: "vhs-collector", name: "Collecteur VHS", description: "10 films dans la collection", icon: "🎬", rarity: "UNCOMMON", category: "CINEMA", criteria: { type: "object_by_type", threshold: 10, params: { objectType: "FILM" } } },
  { slug: "cult-master", name: "Maître du cult", description: "20 films dans la collection", icon: "🌟", rarity: "RARE", category: "CINEMA", criteria: { type: "object_by_type", threshold: 20, params: { objectType: "FILM" } } },
  { slug: "binge-watcher", name: "Viewer compulsif", description: "25 films dans la collection", icon: "📺", rarity: "UNCOMMON", category: "CINEMA", criteria: { type: "object_by_type", threshold: 25, params: { objectType: "FILM" } } },
  { slug: "vhs-maniac", name: "Maniaque du VHS", description: "50 films dans la collection", icon: "🎥", rarity: "RARE", category: "CINEMA", criteria: { type: "object_by_type", threshold: 50, params: { objectType: "FILM" } } },
  { slug: "vhs-temple", name: "Temple du cinéma", description: "100 films dans la collection", icon: "🏛️", rarity: "EPIC", category: "CINEMA", criteria: { type: "object_by_type", threshold: 100, params: { objectType: "FILM" } } },
  { slug: "vhs-legend", name: "Légende VHS", description: "200 films dans la collection", icon: "👑", rarity: "LEGENDARY", category: "CINEMA", criteria: { type: "object_by_type", threshold: 200, params: { objectType: "FILM" } } },
  // Même saga / série (object_max_by_field series FILM) — seuils distincts.
  { slug: "vhs-trilogy", name: "Trilogie complète", description: "3 films d'une même saga", icon: "📚", rarity: "UNCOMMON", category: "CINEMA", criteria: { type: "object_max_by_field", threshold: 3, params: { objectType: "FILM", field: "series" } } },
  { slug: "director-collection", name: "Collection de réalisateur", description: "5 films d'une même saga", icon: "🎬", rarity: "RARE", category: "CINEMA", criteria: { type: "object_max_by_field", threshold: 5, params: { objectType: "FILM", field: "series" } } },
  { slug: "series-collector", name: "Collecteur de séries", description: "8 films d'une même série", icon: "📼", rarity: "UNCOMMON", category: "CINEMA", criteria: { type: "object_max_by_field", threshold: 8, params: { objectType: "FILM", field: "series" } } },
  { slug: "complete-series", name: "Série complète", description: "12 films d'une même série (intégrale)", icon: "✅", rarity: "RARE", category: "CINEMA", criteria: { type: "object_max_by_field", threshold: 12, params: { objectType: "FILM", field: "series" } } },
  { slug: "tv-legend", name: "Légende des séries", description: "20 films d'une même saga", icon: "🏆", rarity: "LEGENDARY", category: "CINEMA", criteria: { type: "object_max_by_field", threshold: 20, params: { objectType: "FILM", field: "series" } } },
  // Genre (object_max_by_field genre + object_by_genre_value).
  { slug: "genre-expert", name: "Expert du genre", description: "10 films d'un même genre", icon: "🎭", rarity: "RARE", category: "CINEMA", criteria: { type: "object_max_by_field", threshold: 10, params: { objectType: "FILM", field: "genre" } } },
  { slug: "blockbuster-fan", name: "Fan de blockbuster", description: "10 films d'action", icon: "🍿", rarity: "COMMON", category: "CINEMA", criteria: { type: "object_by_genre_value", threshold: 10, params: { objectType: "FILM", value: "action" } } },
  { slug: "sitcom-fan", name: "Fan de comédie", description: "10 films de comédie", icon: "😂", rarity: "UNCOMMON", category: "CINEMA", criteria: { type: "object_by_genre_value", threshold: 10, params: { objectType: "FILM", value: "comédie" } } },
  { slug: "drama-king", name: "Roi du drame", description: "10 films de drame", icon: "👑", rarity: "UNCOMMON", category: "CINEMA", criteria: { type: "object_by_genre_value", threshold: 10, params: { objectType: "FILM", value: "drame" } } },
  { slug: "sci-fi-tv", name: "Cinéma SF", description: "5 films de science-fiction", icon: "🚀", rarity: "UNCOMMON", category: "CINEMA", criteria: { type: "object_by_genre_value", threshold: 5, params: { objectType: "FILM", value: "science-fiction" } } },
  // Affiches / photos (object_with_photos_count FILM).
  { slug: "retro-cinema", name: "Cinéma rétro", description: "Premier film avec une affiche (photo)", icon: "📼", rarity: "COMMON", category: "CINEMA", criteria: { type: "object_with_photos_count", threshold: 1, params: { objectType: "FILM" } } },
  { slug: "director-chair", name: "Fauteuil du réalisateur", description: "10 films avec affiche", icon: "🪑", rarity: "UNCOMMON", category: "CINEMA", criteria: { type: "object_with_photos_count", threshold: 10, params: { objectType: "FILM" } } },
  // Prêts (côté propriétaire, filtré FILM).
  { slug: "tv-starter", name: "Premier prêt ciné", description: "Premier film prêté", icon: "📺", rarity: "COMMON", category: "CINEMA", criteria: { type: "loan_as_owner_count", threshold: 1, params: { objectType: "FILM" } } },
  { slug: "lent-series", name: "Films prêtés", description: "10 films prêtés", icon: "📤", rarity: "UNCOMMON", category: "CINEMA", criteria: { type: "loan_as_owner_count", threshold: 10, params: { objectType: "FILM" } } },
  { slug: "tv-marathon", name: "Grand prêteur ciné", description: "25 films prêtés", icon: "🏃", rarity: "RARE", category: "CINEMA", criteria: { type: "loan_as_owner_count", threshold: 25, params: { objectType: "FILM" } } },
  { slug: "collector-dvd", name: "Cinémathèque", description: "50 films prêtés", icon: "💿", rarity: "EPIC", category: "CINEMA", criteria: { type: "loan_as_owner_count", threshold: 50, params: { objectType: "FILM" } } },
  // Emprunts (côté emprunteur, filtré FILM).
  { slug: "movie-buff", name: "Cinéphile", description: "25 films empruntés", icon: "🎬", rarity: "UNCOMMON", category: "CINEMA", criteria: { type: "loan_as_borrower_count", threshold: 25, params: { objectType: "FILM" } } },
  { slug: "borrowed-seasons", name: "Grand emprunteur ciné", description: "50 films empruntés", icon: "📥", rarity: "RARE", category: "CINEMA", criteria: { type: "loan_as_borrower_count", threshold: 50, params: { objectType: "FILM" } } },
  // Fenêtre glissante (loans_within_days FILM).
  { slug: "cinema-marathon", name: "Marathon cinématographique", description: "7 films empruntés en une semaine", icon: "🏃", rarity: "EPIC", category: "CINEMA", criteria: { type: "loans_within_days", threshold: 7, params: { days: 7, objectType: "FILM" } } },
];

// ===========================================
// LITERATURE BADGES (BOOK)
// ===========================================

const literatureBadges: BadgeDef[] = [
  { slug: "bibliophile", name: "Bibliophile", description: "Premier livre ajouté", icon: "📚", rarity: "COMMON", category: "LITERATURE", criteria: { type: "object_by_type", threshold: 1, params: { objectType: "BOOK" } } },
  { slug: "bookworm", name: "Lecteur assidu", description: "10 livres dans la collection", icon: "📖", rarity: "UNCOMMON", category: "LITERATURE", criteria: { type: "object_by_type", threshold: 10, params: { objectType: "BOOK" } } },
  { slug: "library", name: "Petite bibliothèque", description: "25 livres dans la collection", icon: "📚", rarity: "UNCOMMON", category: "LITERATURE", criteria: { type: "object_by_type", threshold: 25, params: { objectType: "BOOK" } } },
  { slug: "grand-library", name: "Grande bibliothèque", description: "50 livres dans la collection", icon: "🏛️", rarity: "RARE", category: "LITERATURE", criteria: { type: "object_by_type", threshold: 50, params: { objectType: "BOOK" } } },
  { slug: "infinite-library", name: "Bibliothèque infinie", description: "100 livres dans la collection", icon: "♾️", rarity: "EPIC", category: "LITERATURE", criteria: { type: "object_by_type", threshold: 100, params: { objectType: "BOOK" } } },
  { slug: "book-cave", name: "Caverne à livres", description: "200 livres dans la collection", icon: "🏔️", rarity: "LEGENDARY", category: "LITERATURE", criteria: { type: "object_by_type", threshold: 200, params: { objectType: "BOOK" } } },
  { slug: "first-novel", name: "Premier roman", description: "Premier livre avec ISBN", icon: "📕", rarity: "COMMON", category: "LITERATURE", criteria: { type: "object_with_isbn_count", threshold: 1, params: { objectType: "BOOK" } } },
  { slug: "collector-series", name: "Collection de série", description: "5 livres d'une même série", icon: "📚", rarity: "UNCOMMON", category: "LITERATURE", criteria: { type: "object_max_by_field", threshold: 5, params: { objectType: "BOOK", field: "series" } } },
  { slug: "comic-reader", name: "Lecteur de BD", description: "10 bandes dessinées (genre BD)", icon: "💬", rarity: "UNCOMMON", category: "LITERATURE", criteria: { type: "object_by_genre_value", threshold: 10, params: { objectType: "BOOK", value: "bd" } } },
  { slug: "manga-fan", name: "Fan de manga", description: "5 mangas (genre manga)", icon: "📘", rarity: "UNCOMMON", category: "LITERATURE", criteria: { type: "object_by_genre_value", threshold: 5, params: { objectType: "BOOK", value: "manga" } } },
  { slug: "sci-fi-collection", name: "Collection SF", description: "10 livres de science-fiction", icon: "🚀", rarity: "RARE", category: "LITERATURE", criteria: { type: "object_by_genre_value", threshold: 10, params: { objectType: "BOOK", value: "science-fiction" } } },
  { slug: "literary-critic", name: "Critique littéraire", description: "10 livres avec photo de couverture", icon: "✍️", rarity: "RARE", category: "LITERATURE", criteria: { type: "object_with_photos_count", threshold: 10, params: { objectType: "BOOK" } } },
  { slug: "loan-archive", name: "Archives du prêt", description: "25 livres prêtés", icon: "📤", rarity: "UNCOMMON", category: "LITERATURE", criteria: { type: "loan_as_owner_count", threshold: 25, params: { objectType: "BOOK" } } },
  { slug: "borrowed-books", name: "Grand lecteur", description: "25 livres empruntés", icon: "📥", rarity: "UNCOMMON", category: "LITERATURE", criteria: { type: "loan_as_borrower_count", threshold: 25, params: { objectType: "BOOK" } } },
  { slug: "well-read", name: "Bien lu", description: "50 livres empruntés", icon: "📚", rarity: "RARE", category: "LITERATURE", criteria: { type: "loan_as_borrower_count", threshold: 50, params: { objectType: "BOOK" } } },
];

// ===========================================
// GAMING BADGES (VIDEOGAME) — plateforme via le champ `edition` (= "Plateforme")
// ===========================================

const gamingBadges: BadgeDef[] = [
  { slug: "first-game", name: "Premier jeu", description: "Premier jeu vidéo ajouté", icon: "🎮", rarity: "COMMON", category: "GAMING", criteria: { type: "object_by_type", threshold: 1, params: { objectType: "VIDEOGAME" } } },
  { slug: "gamer-collector", name: "Collectionneur gamer", description: "10 jeux vidéo", icon: "🕹️", rarity: "UNCOMMON", category: "GAMING", criteria: { type: "object_by_type", threshold: 10, params: { objectType: "VIDEOGAME" } } },
  { slug: "cartridge-hunter", name: "Chasseur de cartouches", description: "20 jeux vidéo", icon: "💎", rarity: "RARE", category: "GAMING", criteria: { type: "object_by_type", threshold: 20, params: { objectType: "VIDEOGAME" } } },
  { slug: "retro-master", name: "Maître du retro", description: "25 jeux vidéo", icon: "👾", rarity: "UNCOMMON", category: "GAMING", criteria: { type: "object_by_type", threshold: 25, params: { objectType: "VIDEOGAME" } } },
  { slug: "pixel-paradise", name: "Paradis du pixel", description: "50 jeux vidéo", icon: "🌴", rarity: "RARE", category: "GAMING", criteria: { type: "object_by_type", threshold: 50, params: { objectType: "VIDEOGAME" } } },
  { slug: "complete-collection", name: "Grande collection", description: "75 jeux vidéo", icon: "🏆", rarity: "EPIC", category: "GAMING", criteria: { type: "object_by_type", threshold: 75, params: { objectType: "VIDEOGAME" } } },
  { slug: "gaming-legend", name: "Légende du gaming", description: "100 jeux vidéo", icon: "👑", rarity: "EPIC", category: "GAMING", criteria: { type: "object_by_type", threshold: 100, params: { objectType: "VIDEOGAME" } } },
  { slug: "retro-pionnier", name: "Pionnier rétro", description: "150 jeux vidéo", icon: "🚀", rarity: "LEGENDARY", category: "GAMING", criteria: { type: "object_by_type", threshold: 150, params: { objectType: "VIDEOGAME" } } },
  // Plateformes — `edition` contient le nom de la plateforme.
  { slug: "nes-owner", name: "Propriétaire NES", description: "5 jeux sur plateforme NES", icon: "🕹️", rarity: "UNCOMMON", category: "GAMING", criteria: { type: "object_by_edition_match", threshold: 5, params: { objectType: "VIDEOGAME", contains: "nes" } } },
  { slug: "snes-owner", name: "Propriétaire SNES", description: "5 jeux sur plateforme SNES", icon: "🎮", rarity: "UNCOMMON", category: "GAMING", criteria: { type: "object_by_edition_match", threshold: 5, params: { objectType: "VIDEOGAME", contains: "snes" } } },
  { slug: "gameboy-fan", name: "Fan Game Boy", description: "5 jeux sur plateforme Game Boy", icon: "📱", rarity: "UNCOMMON", category: "GAMING", criteria: { type: "object_by_edition_match", threshold: 5, params: { objectType: "VIDEOGAME", contains: "game boy" } } },
  { slug: "sega-collector", name: "Collecteur Sega", description: "10 jeux sur plateforme Sega", icon: "🎯", rarity: "RARE", category: "GAMING", criteria: { type: "object_by_edition_match", threshold: 10, params: { objectType: "VIDEOGAME", contains: "sega" } } },
  { slug: "gaming-arcade", name: "Arcade gaming", description: "5 jeux arcade", icon: "🕹️", rarity: "UNCOMMON", category: "GAMING", criteria: { type: "object_by_edition_match", threshold: 5, params: { objectType: "VIDEOGAME", contains: "arcade" } } },
  // Prêts / emprunts (filtrés VIDEOGAME).
  { slug: "lending-gamer", name: "Gamer prêteur", description: "50 jeux prêtés", icon: "🎁", rarity: "RARE", category: "GAMING", criteria: { type: "loan_as_owner_count", threshold: 50, params: { objectType: "VIDEOGAME" } } },
  { slug: "borrow-champion", name: "Champion d'emprunt", description: "50 jeux empruntés", icon: "🥇", rarity: "RARE", category: "GAMING", criteria: { type: "loan_as_borrower_count", threshold: 50, params: { objectType: "VIDEOGAME" } } },
];

// ===========================================
// HARDWARE BADGES (ELECTRONIC / ELECTRIC / TOOL)
// ===========================================

const hardwareBadges: BadgeDef[] = [
  { slug: "first-electronic", name: "Premier électronique", description: "Premier appareil électronique", icon: "🔌", rarity: "COMMON", category: "HARDWARE", criteria: { type: "object_by_type", threshold: 1, params: { objectType: "ELECTRONIC" } } },
  { slug: "gadget-collector", name: "Collectionneur de gadgets", description: "5 appareils électroniques", icon: "📱", rarity: "UNCOMMON", category: "HARDWARE", criteria: { type: "object_by_type", threshold: 5, params: { objectType: "ELECTRONIC" } } },
  { slug: "tech-enthusiast", name: "Enthousiaste tech", description: "10 appareils électroniques", icon: "💻", rarity: "RARE", category: "HARDWARE", criteria: { type: "object_by_type", threshold: 10, params: { objectType: "ELECTRONIC" } } },
  { slug: "electronics-lab", name: "Labo électronique", description: "15 appareils électroniques avec photo", icon: "🔬", rarity: "UNCOMMON", category: "HARDWARE", criteria: { type: "object_with_photos_count", threshold: 15, params: { objectType: "ELECTRONIC" } } },
  { slug: "toolshed", name: "Remise à outils", description: "5 outils ajoutés", icon: "🔧", rarity: "COMMON", category: "HARDWARE", criteria: { type: "object_by_type", threshold: 5, params: { objectType: "TOOL" } } },
  { slug: "maker", name: "Bricoleur", description: "10 outils dans la collection", icon: "🛠️", rarity: "UNCOMMON", category: "HARDWARE", criteria: { type: "object_by_type", threshold: 10, params: { objectType: "TOOL" } } },
  { slug: "manual-tools", name: "Caisse à outils", description: "15 outils dans la collection", icon: "🔩", rarity: "UNCOMMON", category: "HARDWARE", criteria: { type: "object_by_type", threshold: 15, params: { objectType: "TOOL" } } },
  { slug: "workshop", name: "Atelier", description: "20 outils dans la collection", icon: "🏭", rarity: "RARE", category: "HARDWARE", criteria: { type: "object_by_type", threshold: 20, params: { objectType: "TOOL" } } },
  { slug: "power-user", name: "Utilisateur power", description: "5 outils électriques", icon: "⚡", rarity: "UNCOMMON", category: "HARDWARE", criteria: { type: "object_by_type", threshold: 5, params: { objectType: "ELECTRIC" } } },
  { slug: "battery-powered", name: "Outillage électrique", description: "10 outils électriques", icon: "🔋", rarity: "UNCOMMON", category: "HARDWARE", criteria: { type: "object_by_type", threshold: 10, params: { objectType: "ELECTRIC" } } },
  { slug: "lending-tools", name: "Outils prêtés", description: "25 outils prêtés", icon: "🔧", rarity: "UNCOMMON", category: "HARDWARE", criteria: { type: "loan_as_owner_count", threshold: 25, params: { objectType: "TOOL" } } },
  { slug: "borrow-electronics", name: "Appareils empruntés", description: "10 appareils électroniques empruntés", icon: "📻", rarity: "UNCOMMON", category: "HARDWARE", criteria: { type: "loan_as_borrower_count", threshold: 10, params: { objectType: "ELECTRONIC" } } },
];

// ===========================================
// TABLETOP BADGES (BOARD_GAME) — sous-types via le champ `genre`
// ===========================================

const tabletopBadges: BadgeDef[] = [
  { slug: "boardgame-starter", name: "Débutant jeu de société", description: "Premier jeu de société", icon: "🎲", rarity: "COMMON", category: "TABLETOP", criteria: { type: "object_by_type", threshold: 1, params: { objectType: "BOARD_GAME" } } },
  { slug: "boardgame-fan", name: "Fan de jeux de société", description: "5 jeux de société", icon: "🎲", rarity: "UNCOMMON", category: "TABLETOP", criteria: { type: "object_by_type", threshold: 5, params: { objectType: "BOARD_GAME" } } },
  { slug: "boardgame-master", name: "Maître des jeux", description: "10 jeux de société", icon: "🏅", rarity: "UNCOMMON", category: "TABLETOP", criteria: { type: "object_by_type", threshold: 10, params: { objectType: "BOARD_GAME" } } },
  { slug: "dice-collection", name: "Ludothèque", description: "15 jeux de société", icon: "🎲", rarity: "RARE", category: "TABLETOP", criteria: { type: "object_by_type", threshold: 15, params: { objectType: "BOARD_GAME" } } },
  { slug: "game-night", name: "Soirée jeux", description: "25 jeux de société", icon: "🎉", rarity: "RARE", category: "TABLETOP", criteria: { type: "object_by_type", threshold: 25, params: { objectType: "BOARD_GAME" } } },
  { slug: "tabletop-legend", name: "Légende tabletop", description: "50 jeux de société", icon: "🏆", rarity: "EPIC", category: "TABLETOP", criteria: { type: "object_by_type", threshold: 50, params: { objectType: "BOARD_GAME" } } },
  { slug: "strategy-gamer", name: "Stratège", description: "5 jeux de stratégie (genre)", icon: "♟️", rarity: "UNCOMMON", category: "TABLETOP", criteria: { type: "object_by_genre_value", threshold: 5, params: { objectType: "BOARD_GAME", value: "stratégie" } } },
  { slug: "party-games", name: "Jeux de fête", description: "5 jeux d'ambiance (genre party)", icon: "🎊", rarity: "UNCOMMON", category: "TABLETOP", criteria: { type: "object_by_genre_value", threshold: 5, params: { objectType: "BOARD_GAME", value: "party" } } },
  { slug: "rpg-collector", name: "Collectionneur RPG", description: "3 jeux de rôle (genre RPG)", icon: "📒", rarity: "UNCOMMON", category: "TABLETOP", criteria: { type: "object_by_genre_value", threshold: 3, params: { objectType: "BOARD_GAME", value: "rpg" } } },
  { slug: "family-games", name: "Jeux en famille", description: "10 jeux familiaux (genre famille)", icon: "👨‍👩‍👧‍👦", rarity: "UNCOMMON", category: "TABLETOP", criteria: { type: "object_by_genre_value", threshold: 10, params: { objectType: "BOARD_GAME", value: "famille" } } },
  { slug: "lent-games", name: "Jeux prêtés", description: "20 jeux de société prêtés", icon: "📤", rarity: "UNCOMMON", category: "TABLETOP", criteria: { type: "loan_as_owner_count", threshold: 20, params: { objectType: "BOARD_GAME" } } },
  { slug: "borrowed-games", name: "Jeux empruntés", description: "20 jeux de société empruntés", icon: "📥", rarity: "UNCOMMON", category: "TABLETOP", criteria: { type: "loan_as_borrower_count", threshold: 20, params: { objectType: "BOARD_GAME" } } },
];

// ===========================================
// ACCOMPLISHMENTS BADGES (compteurs transverses)
// ===========================================

const accomplishmentsBadges: BadgeDef[] = [
  { slug: "first-loan", name: "Premier prêt", description: "Premier prêt effectué", icon: "🎉", rarity: "COMMON", category: "ACCOMPLISHMENTS", criteria: { type: "loan_as_owner_count", threshold: 1 } },
  { slug: "lender-5", name: "Prêteur confirmé", description: "5 prêts effectués", icon: "⭐", rarity: "COMMON", category: "ACCOMPLISHMENTS", criteria: { type: "loan_as_owner_count", threshold: 5 } },
  { slug: "lender-25", name: "Prêteur expert", description: "25 prêts effectués", icon: "🌟", rarity: "UNCOMMON", category: "ACCOMPLISHMENTS", criteria: { type: "loan_as_owner_count", threshold: 25 } },
  { slug: "reliable-lender", name: "Prêteur fiable", description: "50 prêts effectués", icon: "👍", rarity: "UNCOMMON", category: "ACCOMPLISHMENTS", criteria: { type: "loan_as_owner_count", threshold: 50 } },
  { slug: "lender-100", name: "Prêteur d'élite", description: "100 prêts effectués", icon: "💫", rarity: "RARE", category: "ACCOMPLISHMENTS", criteria: { type: "loan_as_owner_count", threshold: 100 } },
  { slug: "collector-10", name: "Collectionneur", description: "10 objets ajoutés", icon: "📚", rarity: "COMMON", category: "ACCOMPLISHMENTS", criteria: { type: "object_count", threshold: 10 } },
  { slug: "collector-50", name: "Grand collectionneur", description: "50 objets ajoutés", icon: "🏆", rarity: "UNCOMMON", category: "ACCOMPLISHMENTS", criteria: { type: "object_count", threshold: 50 } },
  { slug: "collector-100", name: "Maître collectionneur", description: "100 objets ajoutés", icon: "🏅", rarity: "RARE", category: "ACCOMPLISHMENTS", criteria: { type: "object_count", threshold: 100 } },
  { slug: "collector-250", name: "Collectionneur expert", description: "250 objets ajoutés", icon: "🎖️", rarity: "EPIC", category: "ACCOMPLISHMENTS", criteria: { type: "object_count", threshold: 250 } },
  { slug: "reviewer", name: "Critique", description: "Premier avis laissé", icon: "💬", rarity: "COMMON", category: "ACCOMPLISHMENTS", criteria: { type: "review_count", threshold: 1 } },
  { slug: "critic-10", name: "Critique accompli", description: "10 avis laissés", icon: "📝", rarity: "UNCOMMON", category: "ACCOMPLISHMENTS", criteria: { type: "review_count", threshold: 10 } },
  { slug: "four-stars", name: "Très bon", description: "Note moyenne reçue de 4+ étoiles", icon: "🌟", rarity: "UNCOMMON", category: "ACCOMPLISHMENTS", criteria: { type: "avg_rating", threshold: 4 } },
  { slug: "five-stars", name: "Cinq étoiles", description: "Note moyenne reçue de 5 étoiles", icon: "💎", rarity: "RARE", category: "ACCOMPLISHMENTS", criteria: { type: "avg_rating", threshold: 5 } },
  { slug: "trusted-borrower", name: "Emprunteur fiable", description: "10 prêts retournés à temps", icon: "🤝", rarity: "UNCOMMON", category: "ACCOMPLISHMENTS", criteria: { type: "on_time_returns_count", threshold: 10 } },
  { slug: "super-borrower", name: "Super emprunteur", description: "50 objets empruntés", icon: "🏃", rarity: "RARE", category: "ACCOMPLISHMENTS", criteria: { type: "loan_as_borrower_count", threshold: 50 } },
];

// ===========================================
// SPECIAL BADGES
// ===========================================

const specialBadges: BadgeDef[] = [
  { slug: "early-adopter", name: "Adopteur précoce", description: "A rejoint dans les 30 premiers jours", icon: "🚀", rarity: "EPIC", category: "SPECIAL", criteria: { type: "member_since_days", threshold: 30, operator: "<=" } },
  { slug: "veteran", name: "Vétéran", description: "Membre depuis plus d'un an", icon: "🎖️", rarity: "RARE", category: "SPECIAL", criteria: { type: "member_since_days", threshold: 365, operator: ">=" } },
  { slug: "century-club", name: "Club du siècle", description: "100 prêts et emprunts au total", icon: "💯", rarity: "EPIC", category: "SPECIAL", criteria: { type: "loan_count", threshold: 100 } },
  { slug: "variety-collection", name: "Collection variée", description: "Au moins 5 types d'objets différents", icon: "🎨", rarity: "UNCOMMON", category: "SPECIAL", criteria: { type: "categories_represented", threshold: 5 } },
  { slug: "social-butterfly", name: "Papillon social", description: "10 contacts enregistrés", icon: "🦋", rarity: "UNCOMMON", category: "SPECIAL", criteria: { type: "contact_count", threshold: 10 } },
  { slug: "active-month", name: "Mois actif", description: "Prêt ou emprunt ce mois-ci", icon: "📅", rarity: "COMMON", category: "SPECIAL", criteria: { type: "loans_this_month", threshold: 1 } },
  { slug: "streak-month", name: "Mois en série", description: "3 mois consécutifs avec un prêt", icon: "🔥", rarity: "RARE", category: "SPECIAL", criteria: { type: "loan_streak", threshold: 3 } },
  { slug: "qr-generator", name: "Générateur QR", description: "10 codes QR générés", icon: "📱", rarity: "UNCOMMON", category: "SPECIAL", criteria: { type: "qr_generated_count", threshold: 10 } },
  { slug: "message-sender", name: "Expéditeur", description: "10 messages envoyés à la communauté", icon: "✉️", rarity: "UNCOMMON", category: "SPECIAL", criteria: { type: "messages_sent_count", threshold: 10 } },
  { slug: "community-helper", name: "Aideur communautaire", description: "3 demandes de la communauté satisfaites", icon: "🤝", rarity: "RARE", category: "SPECIAL", criteria: { type: "requests_fulfilled_by_count", threshold: 3 } },
  { slug: "unicorn", name: "Licorne", description: "10 demandes communautaires satisfaites", icon: "🦄", rarity: "EPIC", category: "SPECIAL", criteria: { type: "requests_fulfilled_by_count", threshold: 10 } },
];

// ===========================================
// ALL BADGES
// ===========================================

export const ALL_BADGE_DEFINITIONS: BadgeDef[] = [
  ...cinemaBadges,
  ...literatureBadges,
  ...gamingBadges,
  ...hardwareBadges,
  ...tabletopBadges,
  ...accomplishmentsBadges,
  ...specialBadges,
];

// ===========================================
// SVG ASSETS — pixel art généré par scripts/generate-badge-pixel-art.mjs
// 3 designs par catégorie × 5 raretés. Assignation déterministe par slug.
// ===========================================

export const CATEGORY_DESIGNS: Record<BadgeCategory, { folder: string; designs: string[] }> = {
  CINEMA: { folder: "cinema", designs: ["cinema-vhs-tape", "cinema-clapperboard", "cinema-film-reel"] },
  LITERATURE: { folder: "literature", designs: ["literature-book", "literature-quill", "literature-typewriter"] },
  GAMING: { folder: "gaming", designs: ["gaming-nes-controller", "gaming-cartridge", "gaming-arcade-cabinet"] },
  HARDWARE: { folder: "hardware", designs: ["hardware-floppy-disk", "hardware-cpu", "hardware-circuit"] },
  TABLETOP: { folder: "tabletop", designs: ["tabletop-dice", "tabletop-meeple", "tabletop-scroll"] },
  ACCOMPLISHMENTS: { folder: "accomplishments", designs: ["accomplishments-trophy", "accomplishments-medal", "accomplishments-crown"] },
  SPECIAL: { folder: "special", designs: ["special-crystal", "special-lightning", "special-rainbow"] },
};

/** Chemin SVG (relatif à /public) pour un badge — déterministe par slug. */
export function svgAssetFor(badge: BadgeDef): string {
  const { folder, designs } = CATEGORY_DESIGNS[badge.category];
  const hash = [...badge.slug].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const design = designs[hash % designs.length];
  return `/badges/${folder}/${design}-${badge.rarity.toLowerCase()}.svg`;
}
