"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { BadgeIcon, type BadgeDefinition } from "./badge-icon";

export interface BadgeCardProps {
  badge: BadgeDefinition;
  earned?: boolean;
  onClick?: () => void;
  variant?: "compact" | "full";
}

const RARITY_BORDER_COLORS: Record<string, string> = {
  COMMON: "border-muted-foreground/30",
  UNCOMMON: "border-green-500/50",
  RARE: "border-blue-500/50",
  EPIC: "border-purple-500/50",
  LEGENDARY: "border-amber-500/50",
};

const RARITY_GLOW_CLASSES: Record<string, string> = {
  COMMON: "",
  UNCOMMON: "shadow-[0_0_4px_rgba(34,197,94,0.3)]",
  RARE: "shadow-[0_0_6px_rgba(59,130,246,0.4)]",
  EPIC: "shadow-[0_0_8px_rgba(168,85,247,0.5)]",
  LEGENDARY: "shadow-[0_0_12px_rgba(245,158,11,0.6)]",
};

export function BadgeCard({
  badge,
  earned = false,
  onClick,
  variant = "compact",
}: BadgeCardProps) {
  const rarity = badge.rarity || "COMMON";
  const borderColor = RARITY_BORDER_COLORS[rarity] || RARITY_BORDER_COLORS.COMMON;
  const glowClass = RARITY_GLOW_CLASSES[rarity] || "";

  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left transition-all duration-200 min-w-[200px] max-w-[200px]",
        "bg-card border-2 border-border rounded-sm",
        "hover:border-primary/50 hover:scale-[1.02]",
        "focus:outline-none focus:ring-2 focus:ring-primary",
        borderColor,
        glowClass,
        !earned && "opacity-60"
      )}
      type="button"
    >
      <div className="flex items-start gap-3 p-3">
        <BadgeIcon
          badge={badge}
          size={variant === "full" ? "lg" : "md"}
          earned={earned}
          showRarityGlow={earned && (rarity === "EPIC" || rarity === "LEGENDARY")}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium text-sm truncate",
              earned ? "text-foreground" : "text-muted-foreground"
            )}>
              {badge.name}
            </span>
            {!earned && (
              <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {badge.description}
          </p>
          {!earned && badge.unlockHint && (
            <p className="text-xs text-primary/70 mt-1 italic">
              {badge.unlockHint}
            </p>
          )}
          {variant === "full" && earned && (
            <div className="flex items-center gap-2 mt-2">
              <RarityBadge rarity={rarity} size="sm" />
              {badge.category && (
                <CategoryBadge category={badge.category} size="sm" />
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export function RarityBadge({
  rarity,
  size = "sm",
}: {
  rarity: string;
  size?: "sm" | "md";
}) {
  const colors: Record<string, string> = {
    COMMON: "bg-muted text-muted-foreground",
    UNCOMMON: "bg-green-500/20 text-green-400 border border-green-500/30",
    RARE: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    EPIC: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    LEGENDARY: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  };

  const labels: Record<string, string> = {
    COMMON: "Commun",
    UNCOMMON: "Peu commun",
    RARE: "Rare",
    EPIC: "Épique",
    LEGENDARY: "Légendaire",
  };

  return (
    <span
      className={cn(
        "font-mono uppercase tracking-wider rounded",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
      )}
    >
      {labels[rarity] || rarity}
    </span>
  );
}

export function CategoryBadge({
  category,
  size = "sm",
}: {
  category: string;
  size?: "sm" | "md";
}) {
  const categoryLabels: Record<string, string> = {
    CINEMA: "Cinéma",
    LITERATURE: "Littérature",
    GAMING: "Jeux vidéo",
    TV: "TV/Séries",
    HARDWARE: "Hardware",
    TABLETOP: "Board games",
    ACCOMPLISHMENTS: "Accomplissements",
    SPECIAL: "Spéciaux",
  };

  return (
    <span
      className={cn(
        "font-mono uppercase tracking-wider bg-muted/50 text-muted-foreground rounded",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
      )}
    >
      {categoryLabels[category] || category}
    </span>
  );
}