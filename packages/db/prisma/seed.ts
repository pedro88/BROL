/**
 * Seed script for Brol database.
 * @package @brol/db
 */

import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type BadgeRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
type BadgeCategory = "CINEMA" | "LITERATURE" | "GAMING" | "TV" | "HARDWARE" | "TABLETOP" | "ACCOMPLISHMENTS" | "SPECIAL";

interface BadgeDef {
  slug: string;
  name: string;
  description: string;
  icon: string;
  criteria: Prisma.InputJsonValue;
  rarity: BadgeRarity;
  category: BadgeCategory;
}

// ===========================================
// CINEMA BADGES (15)
// ===========================================

const cinemaBadges: BadgeDef[] = [
  {
    slug: "vhs-pioneer",
    name: "Pionnier VHS",
    description: "Premier film ajouté à la collection",
    icon: "📼",
    criteria: { type: "object_by_type", threshold: 1, params: { objectType: "FILM" } },
    rarity: "COMMON",
    category: "CINEMA",
  },
  {
    slug: "vhs-collector",
    name: "Collecteur VHS",
    description: "10 films dans la collection",
    icon: "🎬",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "FILM" } },
    rarity: "UNCOMMON",
    category: "CINEMA",
  },
  {
    slug: "vhs-maniac",
    name: "Maniaque du VHS",
    description: "50 films dans la collection",
    icon: "🎥",
    criteria: { type: "object_by_type", threshold: 50, params: { objectType: "FILM" } },
    rarity: "RARE",
    category: "CINEMA",
  },
  {
    slug: "vhs-temple",
    name: "Temple du cinéma",
    description: "100 films dans la collection",
    icon: "🏛️",
    criteria: { type: "object_by_type", threshold: 100, params: { objectType: "FILM" } },
    rarity: "EPIC",
    category: "CINEMA",
  },
  {
    slug: "director-collection",
    name: "Collection de réalisateur",
    description: "5 films du même réalisateur",
    icon: "🎬",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "FILM" } },
    rarity: "RARE",
    category: "CINEMA",
  },
  {
    slug: "vhs-trilogy",
    name: "Trilogie complète",
    description: "3 films d'une même trilogie empruntés",
    icon: "📚",
    criteria: { type: "loan_as_borrower_count", threshold: 3 },
    rarity: "UNCOMMON",
    category: "CINEMA",
  },
  {
    slug: "movie-buff",
    name: "Cinephile",
    description: "25 films empruntés au total",
    icon: "🎬",
    criteria: { type: "loan_as_borrower_count", threshold: 25 },
    rarity: "UNCOMMON",
    category: "CINEMA",
  },
  {
    slug: "genre-expert",
    name: "Expert du genre",
    description: "10 films d'un même genre",
    icon: "🎭",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "FILM" } },
    rarity: "RARE",
    category: "CINEMA",
  },
  {
    slug: "retro-cinema",
    name: "Cinéma rétro",
    description: "Un film de plus de 30 ans",
    icon: "📼",
    criteria: { type: "member_since_days", threshold: 0, operator: "first" },
    rarity: "COMMON",
    category: "CINEMA",
  },
  {
    slug: "first-vhs",
    name: "Premier VHS",
    description: "Premier objet ajouté (type film)",
    icon: "📼",
    criteria: { type: "object_by_type", threshold: 1, operator: "first", params: { objectType: "FILM" } },
    rarity: "UNCOMMON",
    category: "CINEMA",
  },
  {
    slug: "cinema-marathon",
    name: "Marathon cinématographique",
    description: "7 films empruntés en une semaine",
    icon: "🏃",
    criteria: { type: "loans_within_days", threshold: 7, params: { days: 7 } },
    rarity: "EPIC",
    category: "CINEMA",
  },
  {
    slug: "director-chair",
    name: "Fauteuil du réalisateur",
    description: "10 objets FILM avec couverture",
    icon: "🪑",
    criteria: { type: "object_with_photos_count", threshold: 10, params: { objectType: "FILM" } },
    rarity: "UNCOMMON",
    category: "CINEMA",
  },
  {
    slug: "vhs-legend",
    name: "Légende VHS",
    description: "200 films dans la collection",
    icon: "👑",
    criteria: { type: "object_by_type", threshold: 200, params: { objectType: "FILM" } },
    rarity: "LEGENDARY",
    category: "CINEMA",
  },
  {
    slug: "cult-master",
    name: "Maître du cult",
    description: "5 films cultes ajoutés (avec notes)",
    icon: "🌟",
    criteria: { type: "object_with_isbn_count", threshold: 5, params: { objectType: "FILM" } },
    rarity: "RARE",
    category: "CINEMA",
  },
  {
    slug: "blockbuster-fan",
    name: "Fan de blockbuster",
    description: "10 films à succès ajoutés",
    icon: "🍿",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "FILM" } },
    rarity: "COMMON",
    category: "CINEMA",
  },
];

// ===========================================
// LITERATURE BADGES (15)
// ===========================================

const literatureBadges: BadgeDef[] = [
  {
    slug: "bibliophile",
    name: "Bibliophile",
    description: "Premier livre ajouté",
    icon: "📚",
    criteria: { type: "object_by_type", threshold: 1, params: { objectType: "BOOK" } },
    rarity: "COMMON",
    category: "LITERATURE",
  },
  {
    slug: "bookworm",
    name: "Lecteur assidu",
    description: "10 livres dans la collection",
    icon: "📖",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "BOOK" } },
    rarity: "UNCOMMON",
    category: "LITERATURE",
  },
  {
    slug: "library",
    name: "Petite bibliothèque",
    description: "25 livres dans la collection",
    icon: "📚",
    criteria: { type: "object_by_type", threshold: 25, params: { objectType: "BOOK" } },
    rarity: "UNCOMMON",
    category: "LITERATURE",
  },
  {
    slug: "grand-library",
    name: "Grande bibliothèque",
    description: "50 livres dans la collection",
    icon: "🏛️",
    criteria: { type: "object_by_type", threshold: 50, params: { objectType: "BOOK" } },
    rarity: "RARE",
    category: "LITERATURE",
  },
  {
    slug: "infinite-library",
    name: "Bibliothèque infinie",
    description: "100 livres dans la collection",
    icon: "♾️",
    criteria: { type: "object_by_type", threshold: 100, params: { objectType: "BOOK" } },
    rarity: "EPIC",
    category: "LITERATURE",
  },
  {
    slug: "first-novel",
    name: "Premier roman",
    description: "Premier livre avec ISBN",
    icon: "📕",
    criteria: { type: "object_with_isbn_count", threshold: 1, params: { objectType: "BOOK" } },
    rarity: "COMMON",
    category: "LITERATURE",
  },
  {
    slug: "collector-series",
    name: "Collection de série",
    description: "5 livres d'une même série",
    icon: "📚",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "BOOK" } },
    rarity: "UNCOMMON",
    category: "LITERATURE",
  },
  {
    slug: "comic-reader",
    name: "Lecteur de BD",
    description: "10 livres (bande dessinée)",
    icon: "💬",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "BOOK" } },
    rarity: "UNCOMMON",
    category: "LITERATURE",
  },
  {
    slug: "manga-fan",
    name: "Fan de manga",
    description: "5 manga dans la collection",
    icon: "📘",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "BOOK" } },
    rarity: "UNCOMMON",
    category: "LITERATURE",
  },
  {
    slug: "sci-fi-collection",
    name: "Collection SF",
    description: "10 livres de science-fiction",
    icon: "🚀",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "BOOK" } },
    rarity: "RARE",
    category: "LITERATURE",
  },
  {
    slug: "loan-archive",
    name: "Archives du prêt",
    description: "25 livres prêtés au total",
    icon: "📤",
    criteria: { type: "loan_as_owner_count", threshold: 25 },
    rarity: "UNCOMMON",
    category: "LITERATURE",
  },
  {
    slug: "borrowed-books",
    name: "Grand lecteur",
    description: "25 livres empruntés",
    icon: "📥",
    criteria: { type: "loan_as_borrower_count", threshold: 25 },
    rarity: "UNCOMMON",
    category: "LITERATURE",
  },
  {
    slug: "well-read",
    name: "Bien lu",
    description: "50 livres empruntés",
    icon: "📚",
    criteria: { type: "loan_as_borrower_count", threshold: 50 },
    rarity: "RARE",
    category: "LITERATURE",
  },
  {
    slug: "book-cave",
    name: "Caverne à livres",
    description: "200 livres dans la collection",
    icon: "🏔️",
    criteria: { type: "object_by_type", threshold: 200, params: { objectType: "BOOK" } },
    rarity: "LEGENDARY",
    category: "LITERATURE",
  },
  {
    slug: "literary-critic",
    name: "Critique littéraire",
    description: "10 livres avec photos de couverture",
    icon: "✍️",
    criteria: { type: "object_with_photos_count", threshold: 10, params: { objectType: "BOOK" } },
    rarity: "RARE",
    category: "LITERATURE",
  },
];

// ===========================================
// GAMING BADGES (15)
// ===========================================

const gamingBadges: BadgeDef[] = [
  {
    slug: "first-game",
    name: "Premier jeu",
    description: "Premier jeu vidéo ajouté",
    icon: "🎮",
    criteria: { type: "object_by_type", threshold: 1, params: { objectType: "VIDEOGAME" } },
    rarity: "COMMON",
    category: "GAMING",
  },
  {
    slug: "gamer-collector",
    name: "Collectionneur gamer",
    description: "10 jeux vidéo",
    icon: "🕹️",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "VIDEOGAME" } },
    rarity: "UNCOMMON",
    category: "GAMING",
  },
  {
    slug: "retro-master",
    name: "Maître du retro",
    description: "25 jeux vidéo",
    icon: "👾",
    criteria: { type: "object_by_type", threshold: 25, params: { objectType: "VIDEOGAME" } },
    rarity: "UNCOMMON",
    category: "GAMING",
  },
  {
    slug: "pixel-paradise",
    name: "Paradis du pixel",
    description: "50 jeux vidéo",
    icon: "🌴",
    criteria: { type: "object_by_type", threshold: 50, params: { objectType: "VIDEOGAME" } },
    rarity: "RARE",
    category: "GAMING",
  },
  {
    slug: "nes-owner",
    name: "Propriétaire NES",
    description: "5 jeux NES",
    icon: "🕹️",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "VIDEOGAME" } },
    rarity: "UNCOMMON",
    category: "GAMING",
  },
  {
    slug: "snes-owner",
    name: "Propriétaire SNES",
    description: "5 jeux SNES",
    icon: "🎮",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "VIDEOGAME" } },
    rarity: "UNCOMMON",
    category: "GAMING",
  },
  {
    slug: "gameboy-fan",
    name: "Fan Game Boy",
    description: "5 jeux Game Boy",
    icon: "📱",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "VIDEOGAME" } },
    rarity: "UNCOMMON",
    category: "GAMING",
  },
  {
    slug: "sega-collector",
    name: "Collecteur Sega",
    description: "10 jeux Sega",
    icon: "🎯",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "VIDEOGAME" } },
    rarity: "RARE",
    category: "GAMING",
  },
  {
    slug: "complete-collection",
    name: "Collection complète",
    description: "10 consoles différentes",
    icon: "🏆",
    criteria: { type: "collection_count", threshold: 10 },
    rarity: "EPIC",
    category: "GAMING",
  },
  {
    slug: "gaming-legend",
    name: "Légende du gaming",
    description: "100 jeux vidéo",
    icon: "👑",
    criteria: { type: "object_by_type", threshold: 100, params: { objectType: "VIDEOGAME" } },
    rarity: "EPIC",
    category: "GAMING",
  },
  {
    slug: "cartridge-hunter",
    name: "Chasseur de cartouches",
    description: "20 jeux sur cartouche",
    icon: "💎",
    criteria: { type: "object_by_type", threshold: 20, params: { objectType: "VIDEOGAME" } },
    rarity: "RARE",
    category: "GAMING",
  },
  {
    slug: "borrow-champion",
    name: "Champion d'emprunt",
    description: "50 jeux empruntés",
    icon: "🥇",
    criteria: { type: "loan_as_borrower_count", threshold: 50 },
    rarity: "RARE",
    category: "GAMING",
  },
  {
    slug: "lending-gamer",
    name: "Gamer prêteur",
    description: "50 jeux prêtés",
    icon: "🎁",
    criteria: { type: "loan_as_owner_count", threshold: 50 },
    rarity: "RARE",
    category: "GAMING",
  },
  {
    slug: "gaming-arcade",
    name: "Arcade gaming",
    description: "5 jeux avec caution (arcade)",
    icon: "🕹️",
    criteria: { type: "object_with_caution_count", threshold: 5 },
    rarity: "UNCOMMON",
    category: "GAMING",
  },
  {
    slug: "retro-pionnier",
    name: "Pionnier rétro",
    description: "Premier utilisateur avec 10 jeux",
    icon: "🚀",
    criteria: { type: "object_by_type", threshold: 10, operator: "first", params: { objectType: "VIDEOGAME" } },
    rarity: "LEGENDARY",
    category: "GAMING",
  },
];

// ===========================================
// TV BADGES (12)
// ===========================================

const tvBadges: BadgeDef[] = [
  {
    slug: "tv-starter",
    name: "Débutant TV",
    description: "Premier DVD/Blu-ray ajouté",
    icon: "📺",
    criteria: { type: "object_by_type", threshold: 1, params: { objectType: "FILM" } },
    rarity: "COMMON",
    category: "TV",
  },
  {
    slug: "series-collector",
    name: "Collecteur de séries",
    description: "10 saisons/épisodes",
    icon: "📼",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "FILM" } },
    rarity: "UNCOMMON",
    category: "TV",
  },
  {
    slug: "binge-watcher",
    name: "Viewer compulsif",
    description: "25 DVDs/Blu-rays",
    icon: "📺",
    criteria: { type: "object_by_type", threshold: 25, params: { objectType: "FILM" } },
    rarity: "UNCOMMON",
    category: "TV",
  },
  {
    slug: "complete-series",
    name: "Série complète",
    description: "5 saisons d'une même série",
    icon: "✅",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "FILM" } },
    rarity: "RARE",
    category: "TV",
  },
  {
    slug: "tv-marathon",
    name: "Marathon TV",
    description: "50 DVDs/Blu-rays",
    icon: "🏃",
    criteria: { type: "object_by_type", threshold: 50, params: { objectType: "FILM" } },
    rarity: "RARE",
    category: "TV",
  },
  {
    slug: "sitcom-fan",
    name: "Fan de sitcom",
    description: "10 sitcoms dans la collection",
    icon: "😂",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "FILM" } },
    rarity: "UNCOMMON",
    category: "TV",
  },
  {
    slug: "drama-king",
    name: "Roi du drama",
    description: "10 dramas dans la collection",
    icon: "👑",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "FILM" } },
    rarity: "UNCOMMON",
    category: "TV",
  },
  {
    slug: "sci-fi-tv",
    name: "TV SF",
    description: "5 séries de science-fiction",
    icon: "🚀",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "FILM" } },
    rarity: "UNCOMMON",
    category: "TV",
  },
  {
    slug: "lent-series",
    name: "Séries prêtées",
    description: "25 séries prêtées",
    icon: "📤",
    criteria: { type: "loan_as_owner_count", threshold: 25 },
    rarity: "UNCOMMON",
    category: "TV",
  },
  {
    slug: "borrowed-seasons",
    name: "Saisons empruntées",
    description: "25 saisons empruntées",
    icon: "📥",
    criteria: { type: "loan_as_borrower_count", threshold: 25 },
    rarity: "RARE",
    category: "TV",
  },
  {
    slug: "collector-dvd",
    name: "Collectionneur DVD",
    description: "100 DVDs/Blu-rays",
    icon: "💿",
    criteria: { type: "object_by_type", threshold: 100, params: { objectType: "FILM" } },
    rarity: "EPIC",
    category: "TV",
  },
  {
    slug: "tv-legend",
    name: "Légende TV",
    description: "200 DVDs/Blu-rays",
    icon: "🏆",
    criteria: { type: "object_by_type", threshold: 200, params: { objectType: "FILM" } },
    rarity: "LEGENDARY",
    category: "TV",
  },
];

// ===========================================
// HARDWARE BADGES (12)
// ===========================================

const hardwareBadges: BadgeDef[] = [
  {
    slug: "first-electronic",
    name: "Premier électronique",
    description: "Premier appareil électronique",
    icon: "🔌",
    criteria: { type: "object_by_type", threshold: 1, params: { objectType: "ELECTRONIC" } },
    rarity: "COMMON",
    category: "HARDWARE",
  },
  {
    slug: "gadget-collector",
    name: "Collectionneur de gadgets",
    description: "5 appareils électroniques",
    icon: "📱",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "ELECTRONIC" } },
    rarity: "UNCOMMON",
    category: "HARDWARE",
  },
  {
    slug: "tech-enthusiast",
    name: "Enthousiaste tech",
    description: "10 appareils électroniques",
    icon: "💻",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "ELECTRONIC" } },
    rarity: "RARE",
    category: "HARDWARE",
  },
  {
    slug: "toolshed",
    name: "Remise à outils",
    description: "5 outils ajoutés",
    icon: "🔧",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "TOOL" } },
    rarity: "COMMON",
    category: "HARDWARE",
  },
  {
    slug: "maker",
    name: "Bricoleur",
    description: "10 outils dans la collection",
    icon: "🛠️",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "TOOL" } },
    rarity: "UNCOMMON",
    category: "HARDWARE",
  },
  {
    slug: "power-user",
    name: "Utilisateur power",
    description: "5 outils électriques",
    icon: "⚡",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "ELECTRIC" } },
    rarity: "UNCOMMON",
    category: "HARDWARE",
  },
  {
    slug: "workshop",
    name: "Atelier",
    description: "20 outils dans la collection",
    icon: "🏭",
    criteria: { type: "object_by_type", threshold: 20, params: { objectType: "TOOL" } },
    rarity: "RARE",
    category: "HARDWARE",
  },
  {
    slug: "electronics-lab",
    name: "Labo électronique",
    description: "15 appareils avec photos",
    icon: "🔬",
    criteria: { type: "object_with_photos_count", threshold: 15, params: { objectType: "ELECTRONIC" } },
    rarity: "UNCOMMON",
    category: "HARDWARE",
  },
  {
    slug: "manual-tools",
    name: "Outils manuels",
    description: "10 outils non électriques",
    icon: "🔩",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "TOOL" } },
    rarity: "UNCOMMON",
    category: "HARDWARE",
  },
  {
    slug: "battery-powered",
    name: "Sur batterie",
    description: "5 outils sur batterie",
    icon: "🔋",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "TOOL" } },
    rarity: "UNCOMMON",
    category: "HARDWARE",
  },
  {
    slug: "lending-tools",
    name: "Outils prêtés",
    description: "25 outils prêtés",
    icon: "🔧",
    criteria: { type: "loan_as_owner_count", threshold: 25, params: { objectType: "TOOL" } },
    rarity: "UNCOMMON",
    category: "HARDWARE",
  },
  {
    slug: "borrow-electronics",
    name: "Appareils empruntés",
    description: "10 appareils électroniques empruntés",
    icon: "📻",
    criteria: { type: "loan_as_borrower_count", threshold: 10, params: { objectType: "ELECTRONIC" } },
    rarity: "UNCOMMON",
    category: "HARDWARE",
  },
];

// ===========================================
// TABLETOP BADGES (12)
// ===========================================

const tabletopBadges: BadgeDef[] = [
  {
    slug: "boardgame-starter",
    name: "Débutant jeu de société",
    description: "Premier jeu de société",
    icon: "🎲",
    criteria: { type: "object_by_type", threshold: 1, params: { objectType: "BOARD_GAME" } },
    rarity: "COMMON",
    category: "TABLETOP",
  },
  {
    slug: "boardgame-fan",
    name: "Fan de jeux de société",
    description: "5 jeux de société",
    icon: "🎲",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "BOARD_GAME" } },
    rarity: "UNCOMMON",
    category: "TABLETOP",
  },
  {
    slug: "boardgame-master",
    name: "Maître des jeux",
    description: "10 jeux de société",
    icon: "🏅",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "BOARD_GAME" } },
    rarity: "UNCOMMON",
    category: "TABLETOP",
  },
  {
    slug: "game-night",
    name: "Soirée jeux",
    description: "25 jeux de société",
    icon: "🎉",
    criteria: { type: "object_by_type", threshold: 25, params: { objectType: "BOARD_GAME" } },
    rarity: "RARE",
    category: "TABLETOP",
  },
  {
    slug: "strategy-gamer",
    name: "Stratège",
    description: "5 jeux de stratégie",
    icon: "♟️",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "BOARD_GAME" } },
    rarity: "UNCOMMON",
    category: "TABLETOP",
  },
  {
    slug: "party-games",
    name: "Jeux de fête",
    description: "5 jeux de party",
    icon: "🎊",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "BOARD_GAME" } },
    rarity: "UNCOMMON",
    category: "TABLETOP",
  },
  {
    slug: "rpg-collector",
    name: "Collectionneur RPG",
    description: "3 livres/scénarios RPG",
    icon: "📒",
    criteria: { type: "object_by_type", threshold: 3, params: { objectType: "BOARD_GAME" } },
    rarity: "UNCOMMON",
    category: "TABLETOP",
  },
  {
    slug: "family-games",
    name: "Jeux en famille",
    description: "10 jeux pour tous publics",
    icon: "👨‍👩‍👧‍👦",
    criteria: { type: "object_by_type", threshold: 10, params: { objectType: "BOARD_GAME" } },
    rarity: "UNCOMMON",
    category: "TABLETOP",
  },
  {
    slug: "dice-collection",
    name: "Collection de dés",
    description: "5 sets de dés RPG",
    icon: "🎲",
    criteria: { type: "object_by_type", threshold: 5, params: { objectType: "BOARD_GAME" } },
    rarity: "RARE",
    category: "TABLETOP",
  },
  {
    slug: "lent-games",
    name: "Jeux prêtés",
    description: "20 jeux de société prêtés",
    icon: "📤",
    criteria: { type: "loan_as_owner_count", threshold: 20, params: { objectType: "BOARD_GAME" } },
    rarity: "UNCOMMON",
    category: "TABLETOP",
  },
  {
    slug: "borrowed-games",
    name: "Jeux empruntés",
    description: "20 jeux de société empruntés",
    icon: "📥",
    criteria: { type: "loan_as_borrower_count", threshold: 20, params: { objectType: "BOARD_GAME" } },
    rarity: "UNCOMMON",
    category: "TABLETOP",
  },
  {
    slug: "tabletop-legend",
    name: "Légende tabletop",
    description: "50 jeux de société",
    icon: "🏆",
    criteria: { type: "object_by_type", threshold: 50, params: { objectType: "BOARD_GAME" } },
    rarity: "EPIC",
    category: "TABLETOP",
  },
];

// ===========================================
// ACCOMPLISHMENTS BADGES (15)
// ===========================================

const accomplishmentsBadges: BadgeDef[] = [
  {
    slug: "first-loan",
    name: "Premier prêt",
    description: "Votre premier prêt effectué",
    icon: "🎉",
    criteria: { type: "loan_count", threshold: 1 },
    rarity: "COMMON",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "lender-5",
    name: "Prêteur confirmé",
    description: "5 prêts effectués",
    icon: "⭐",
    criteria: { type: "loan_count", threshold: 5 },
    rarity: "COMMON",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "lender-25",
    name: "Prêteur expert",
    description: "25 prêts effectués",
    icon: "🌟",
    criteria: { type: "loan_count", threshold: 25 },
    rarity: "UNCOMMON",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "lender-100",
    name: "Prêteur d'élite",
    description: "100 prêts effectués",
    icon: "💫",
    criteria: { type: "loan_count", threshold: 100 },
    rarity: "RARE",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "collector-10",
    name: "Collectionneur",
    description: "10 objets ajoutés",
    icon: "📚",
    criteria: { type: "object_count", threshold: 10 },
    rarity: "COMMON",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "collector-50",
    name: "Grand collectionneur",
    description: "50 objets ajoutés",
    icon: "🏆",
    criteria: { type: "object_count", threshold: 50 },
    rarity: "UNCOMMON",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "collector-100",
    name: "Maître collectionneur",
    description: "100 objets ajoutés",
    icon: "🏅",
    criteria: { type: "object_count", threshold: 100 },
    rarity: "RARE",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "collector-250",
    name: "Collectionneur expert",
    description: "250 objets ajoutés",
    icon: "🎖️",
    criteria: { type: "object_count", threshold: 250 },
    rarity: "EPIC",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "reviewer",
    name: "Critique",
    description: "Premier avis laissé",
    icon: "💬",
    criteria: { type: "review_count", threshold: 1 },
    rarity: "COMMON",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "critic-10",
    name: "Critique accompli",
    description: "10 avis laissés",
    icon: "📝",
    criteria: { type: "review_count", threshold: 10 },
    rarity: "UNCOMMON",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "five-stars",
    name: "Cinq étoiles",
    description: "Note moyenne de 5 étoiles",
    icon: "💎",
    criteria: { type: "avg_rating", threshold: 5 },
    rarity: "RARE",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "four-stars",
    name: "Très bon",
    description: "Note moyenne de 4+ étoiles",
    icon: "🌟",
    criteria: { type: "avg_rating", threshold: 4 },
    rarity: "UNCOMMON",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "trusted-borrower",
    name: "Emprunteur fiable",
    description: "10 prêts retournés à temps",
    icon: "🤝",
    criteria: { type: "on_time_returns_count", threshold: 10 },
    rarity: "UNCOMMON",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "reliable-lender",
    name: "Prêteur fiable",
    description: "25 prêts effectués",
    icon: "👍",
    criteria: { type: "loan_as_owner_count", threshold: 25 },
    rarity: "UNCOMMON",
    category: "ACCOMPLISHMENTS",
  },
  {
    slug: "super-borrower",
    name: "Super emprunteur",
    description: "50 objets empruntés",
    icon: "🏃",
    criteria: { type: "loan_as_borrower_count", threshold: 50 },
    rarity: "RARE",
    category: "ACCOMPLISHMENTS",
  },
];

// ===========================================
// SPECIAL BADGES (12)
// ===========================================

const specialBadges: BadgeDef[] = [
  {
    slug: "early-adopter",
    name: "Adopteur précoce",
    description: "A rejoint dans les 30 premiers jours",
    icon: "🚀",
    criteria: { type: "member_since_days", threshold: 30, operator: "<=" },
    rarity: "EPIC",
    category: "SPECIAL",
  },
  {
    slug: "veteran",
    name: "Vétéran",
    description: "Membre depuis plus d'un an",
    icon: "🎖️",
    criteria: { type: "member_since_days", threshold: 365, operator: ">=" },
    rarity: "RARE",
    category: "SPECIAL",
  },
  {
    slug: "century-club",
    name: "Club du siècle",
    description: "100 prêts au total",
    icon: "💯",
    criteria: { type: "loan_count", threshold: 100 },
    rarity: "EPIC",
    category: "SPECIAL",
  },
  {
    slug: "variety-collection",
    name: "Collection variée",
    description: "Au moins 5 types d'objets différents",
    icon: "🎨",
    criteria: { type: "has_all_object_types", threshold: 5 },
    rarity: "UNCOMMON",
    category: "SPECIAL",
  },
  {
    slug: "social-butterfly",
    name: "Papillon social",
    description: "10 contacts enregistrés",
    icon: "🦋",
    criteria: { type: "contact_count", threshold: 10 },
    rarity: "UNCOMMON",
    category: "SPECIAL",
  },
  {
    slug: "active-month",
    name: "Mois actif",
    description: "Prêt ou emprunt ce mois-ci",
    icon: "📅",
    criteria: { type: "loans_this_month", threshold: 1 },
    rarity: "COMMON",
    category: "SPECIAL",
  },
  {
    slug: "streak-month",
    name: "Mois streak",
    description: "3 mois consécutifs avec prêt",
    icon: "🔥",
    criteria: { type: "loan_streak", threshold: 3 },
    rarity: "RARE",
    category: "SPECIAL",
  },
  {
    slug: "qr-generator",
    name: "Générateur QR",
    description: "10 codes QR générés",
    icon: "📱",
    criteria: { type: "qr_generated_count", threshold: 10 },
    rarity: "UNCOMMON",
    category: "SPECIAL",
  },
  {
    slug: "message-sender",
    name: "Expéditeur",
    description: "10 messages envoyés",
    icon: "✉️",
    criteria: { type: "messages_sent_count", threshold: 10 },
    rarity: "UNCOMMON",
    category: "SPECIAL",
  },
  {
    slug: "community-helper",
    name: "Aideur communautaire",
    description: "3 demandes de la communauté fulfill",
    icon: "🤝",
    criteria: { type: "requests_fulfilled_by_count", threshold: 3 },
    rarity: "RARE",
    category: "SPECIAL",
  },
  {
    slug: "unicorn",
    name: "Licorne",
    description: "A fulfill 10 demandes communautaires",
    icon: "🦄",
    criteria: { type: "requests_fulfilled_by_count", threshold: 10 },
    rarity: "EPIC",
    category: "SPECIAL",
  },
];

// ===========================================
// ALL BADGES
// ===========================================

const ALL_BADGE_DEFINITIONS: BadgeDef[] = [
  ...cinemaBadges,
  ...literatureBadges,
  ...gamingBadges,
  ...tvBadges,
  ...hardwareBadges,
  ...tabletopBadges,
  ...accomplishmentsBadges,
  ...specialBadges,
];

// ===========================================
// SEED FUNCTION
// ===========================================


// ===========================================
// SVG ASSETS — pixel art généré par scripts/generate-badge-pixel-art.mjs
// 3 designs par catégorie × 5 raretés. Assignation déterministe par slug.
// ===========================================

const CATEGORY_DESIGNS: Record<BadgeCategory, { folder: string; designs: string[] }> = {
  CINEMA: { folder: "cinema", designs: ["cinema-vhs-tape", "cinema-clapperboard", "cinema-film-reel"] },
  LITERATURE: { folder: "literature", designs: ["literature-book", "literature-quill", "literature-typewriter"] },
  GAMING: { folder: "gaming", designs: ["gaming-nes-controller", "gaming-cartridge", "gaming-arcade-cabinet"] },
  TV: { folder: "television", designs: ["television-old-tv", "television-antenna", "television-remote"] },
  HARDWARE: { folder: "hardware", designs: ["hardware-floppy-disk", "hardware-cpu", "hardware-circuit"] },
  TABLETOP: { folder: "tabletop", designs: ["tabletop-dice", "tabletop-meeple", "tabletop-scroll"] },
  ACCOMPLISHMENTS: { folder: "accomplishments", designs: ["accomplishments-trophy", "accomplishments-medal", "accomplishments-crown"] },
  SPECIAL: { folder: "special", designs: ["special-crystal", "special-lightning", "special-rainbow"] },
};

/** Chemin SVG (relatif à /public) pour un badge — déterministe par slug. */
function svgAssetFor(badge: BadgeDef): string {
  const { folder, designs } = CATEGORY_DESIGNS[badge.category];
  const hash = [...badge.slug].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const design = designs[hash % designs.length];
  return `/badges/${folder}/${design}-${badge.rarity.toLowerCase()}.svg`;
}

async function main() {
  console.log("🌱 Seeding badge definitions...");

  const countMap: Record<string, number> = {
    CINEMA: 0,
    LITERATURE: 0,
    GAMING: 0,
    TV: 0,
    HARDWARE: 0,
    TABLETOP: 0,
    ACCOMPLISHMENTS: 0,
    SPECIAL: 0,
  };

  for (const badge of ALL_BADGE_DEFINITIONS) {
    const data = { ...badge, svgAsset: svgAssetFor(badge) };
    await prisma.badgeDefinition.upsert({
      where: { slug: badge.slug },
      update: data,
      create: data,
    });
    countMap[badge.category]++;
    console.log(`  ✓ ${badge.name} (${badge.rarity})`);
  }

  console.log("\n📊 Badge counts by category:");
  for (const [cat, count] of Object.entries(countMap)) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log(`\n✅ Total: ${ALL_BADGE_DEFINITIONS.length} badges`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });