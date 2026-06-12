"use client";

import { Header, Navigation } from "@/components/navigation";
import { trpc } from "@/lib/trpc";
import { useTranslations } from "next-intl";
import { Trophy, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { BadgeCard } from "@/components/badges/badge-card";
import { BadgeModal } from "@/components/badges/badge-modal";
import type { BadgeDefinition } from "@/components/badges/badge-icon";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "all", label: "Tous" },
  { key: "CINEMA", label: "Cinéma/VHS" },
  { key: "LITERATURE", label: "Littérature" },
  { key: "GAMING", label: "Jeux vidéo" },
  { key: "TV", label: "TV/Séries" },
  { key: "HARDWARE", label: "Hardware" },
  { key: "TABLETOP", label: "Board games" },
  { key: "ACCOMPLISHMENTS", label: "Accomplissements" },
  { key: "SPECIAL", label: "Spéciaux" },
] as const;

const RARITIES = [
  { key: "all", label: "Toutes rarités" },
  { key: "COMMON", label: "Commun" },
  { key: "UNCOMMON", label: "Peu commun" },
  { key: "RARE", label: "Rare" },
  { key: "EPIC", label: "Épique" },
  { key: "LEGENDARY", label: "Légendaire" },
] as const;

const SORT_OPTIONS = [
  { key: "name", label: "A → Z" },
  { key: "rarity", label: "Rareté" },
  { key: "newest", label: "Plus récent" },
  { key: "category", label: "Catégorie" },
] as const;

const RARITY_ORDER: Record<string, number> = {
  LEGENDARY: 0,
  EPIC: 1,
  RARE: 2,
  UNCOMMON: 3,
  COMMON: 4,
};

type CategoryKey = (typeof CATEGORIES)[number]["key"];
type RarityKey = (typeof RARITIES)[number]["key"];
type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export default function BadgesPage() {
  const t = useTranslations("badges");

  const { data: sessionData } = trpc.auth.me.useQuery();
  const userId = sessionData?.user?.id;

  const { data: definitions, isLoading: loadingDefinitions } =
    trpc.badge.definitions.useQuery();

  const { data: myBadges, isLoading: loadingMyBadges } =
    trpc.badge.list.useQuery(
      { userId: userId ?? "" },
      { enabled: !!userId }
    );

  const isLoading = loadingDefinitions || loadingMyBadges;

  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [rarityFilter, setRarityFilter] = useState<RarityKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const earnedSlugs = new Set(myBadges?.map((b) => b.slug) ?? []);

  const filteredBadges = useMemo(() => {
    if (!definitions) return [];

    let result = [...definitions];

    if (activeCategory !== "all") {
      result = result.filter((b) => b.category === activeCategory);
    }

    if (rarityFilter !== "all") {
      result = result.filter((b) => b.rarity === rarityFilter);
    }

    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rarity":
        result.sort(
          (a, b) =>
            (RARITY_ORDER[a.rarity || "COMMON"] || 5) -
            (RARITY_ORDER[b.rarity || "COMMON"] || 5)
        );
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
      case "category":
        result.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
        break;
    }

    return result;
  }, [definitions, activeCategory, rarityFilter, sortBy]);

  const categoryProgress = useMemo(() => {
    if (!definitions || !myBadges) return [];

    return CATEGORIES.filter((c) => c.key !== "all").map((cat) => {
      const total = definitions.filter((d) => d.category === cat.key).length;
      const earned = myBadges.filter((b) => b.category === cat.key).length;
      return { ...cat, total, earned };
    });
  }, [definitions, myBadges]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="p-4">
          <div className="spinner-vhs w-8 h-8 mx-auto mt-8" />
        </main>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="p-4 space-y-6">
        <h1 className="font-display text-3xl vhs-text-glow text-primary uppercase">
          {t("title")}
        </h1>
        {userId && myBadges && myBadges.length > 0 && (
          <section className="card-vhs p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg vhs-text-glow text-primary">
                {t("myProgress")}
              </h2>
              <span className="font-mono text-sm text-primary">
                {myBadges.length} / {definitions?.length ?? 0}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categoryProgress.slice(0, 4).map((cat) => (
                <CategoryProgressItem
                  key={cat.key}
                  label={cat.label}
                  earned={cat.earned}
                  total={cat.total}
                />
              ))}
            </div>

            {categoryProgress.length > 4 && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {categoryProgress.slice(4).map((cat) => (
                  <CategoryProgressItem
                    key={cat.key}
                    label={cat.label}
                    earned={cat.earned}
                    total={cat.total}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-muted-foreground uppercase">
                  Total
                </span>
                <span className="font-display text-primary">
                  {myBadges.length} / {definitions?.length ?? 0}
                </span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${((myBadges.length || 0) / (definitions?.length || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg vhs-text-glow text-primary">
              {t("allBadges")}
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <span className="font-mono uppercase">Filtres</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  showFilters && "rotate-180"
                )}
              />
            </button>
          </div>

          {showFilters && (
            <div className="card-vhs p-4 mb-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={cn(
                      "px-3 py-1.5 font-mono text-xs uppercase rounded border transition-colors",
                      activeCategory === cat.key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground uppercase">
                    Rareté
                  </span>
                  <select
                    value={rarityFilter}
                    onChange={(e) => setRarityFilter(e.target.value as RarityKey)}
                    className="bg-card border border-border rounded px-2 py-1 font-mono text-xs"
                  >
                    {RARITIES.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground uppercase">
                    Trier
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="bg-card border border-border rounded px-2 py-1 font-mono text-xs"
                  >
                    {SORT_OPTIONS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredBadges.map((def) => {
              const earned = earnedSlugs.has(def.slug);
              const myBadge = myBadges?.find((b) => b.slug === def.slug);
              return (
                <BadgeCard
                  key={def.slug}
                  badge={def as BadgeDefinition}
                  earned={earned}
                  onClick={() => setSelectedBadge(def as BadgeDefinition)}
                />
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="card-vhs p-8 text-center">
              <p className="font-mono text-sm text-muted-foreground">
                Aucun badge ne correspond aux filtres
              </p>
            </div>
          )}
        </section>
      </main>
      <Navigation />

      <BadgeModal
        badge={selectedBadge}
        earned={selectedBadge ? earnedSlugs.has(selectedBadge.slug) : false}
        onClose={() => setSelectedBadge(null)}
      />
    </div>
  );
}

function CategoryProgressItem({
  label,
  earned,
  total,
}: {
  label: string;
  earned: number;
  total: number;
}) {
  const progress = total > 0 ? earned / total : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] text-muted-foreground truncate">
            {label}
          </span>
          <span className="font-mono text-[10px] text-primary">
            {earned}/{total}
          </span>
        </div>
        <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}