"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type BadgeSize = "sm" | "md" | "lg" | "xl";

export interface BadgeDefinition {
  id?: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  category?: string;
  svgAsset?: string;
  unlockHint?: string;
  earned?: boolean;
  earnedAt?: Date;
}

interface BadgeIconPropsNew {
  slug: string;
  icon: string;
  svgAsset?: string;
  rarity: BadgeRarity;
  size?: BadgeSize;
  className?: string;
}

interface BadgeIconPropsLegacy {
  badge: BadgeDefinition;
  size?: BadgeSize;
  earned?: boolean;
  showRarityGlow?: boolean;
  className?: string;
}

type BadgeIconProps = BadgeIconPropsNew | BadgeIconPropsLegacy;

const sizeClasses: Record<BadgeSize, string> = {
  sm: "size-6",
  md: "size-10",
  lg: "size-16",
  xl: "size-20",
};

const sizePx: Record<BadgeSize, number> = {
  sm: 24,
  md: 40,
  lg: 64,
  xl: 80,
};

const rarityGlowClass: Record<string, string> = {
  common: "badge-glow-common",
  COMMON: "badge-glow-common",
  uncommon: "badge-glow-uncommon",
  UNCOMMON: "badge-glow-uncommon",
  rare: "badge-glow-rare",
  RARE: "badge-glow-rare",
  epic: "badge-glow-epic",
  EPIC: "badge-glow-epic",
  legendary: "badge-glow-legendary",
  LEGENDARY: "badge-glow-legendary",
};

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    COMMON: "#888888",
    UNCOMMON: "#00CCAA",
    RARE: "#00BFFF",
    EPIC: "#9933FF",
    LEGENDARY: "#FFD700",
    common: "#888888",
    uncommon: "#00CCAA",
    rare: "#00BFFF",
    epic: "#9933FF",
    legendary: "#FFD700",
  };
  return colors[rarity] || colors.COMMON;
}

function isLegacyProps(props: BadgeIconProps): props is BadgeIconPropsLegacy {
  return "badge" in props;
}

export function BadgeIcon(props: BadgeIconProps) {
  let slug: string;
  let icon: string;
  let svgAsset: string | undefined;
  let rarity: string;
  let size: BadgeSize = "md";
  let className: string | undefined;

  if (isLegacyProps(props)) {
    const { badge, size: propsSize, className: propsClassName } = props;
    slug = badge.slug;
    icon = badge.icon;
    svgAsset = badge.svgAsset;
    rarity = badge.rarity;
    size = propsSize || "md";
    className = propsClassName;
  } else {
    slug = props.slug;
    icon = props.icon;
    svgAsset = props.svgAsset;
    rarity = props.rarity;
    size = props.size || "md";
    className = props.className;
  }

  const glowClass = rarityGlowClass[rarity] || rarityGlowClass.COMMON;
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const pixelSize = sizePx[size] || sizePx.md;

  const containerClass = cn(
    "inline-flex items-center justify-center rounded",
    glowClass,
    sizeClass,
    className
  );

  if (svgAsset) {
    return (
      <span className={containerClass} title={slug}>
        <Image
          src={svgAsset}
          alt={slug}
          width={pixelSize}
          height={pixelSize}
          className="size-full object-contain"
        />
      </span>
    );
  }

  return (
    <span className={containerClass} title={slug}>
      {icon}
    </span>
  );
}