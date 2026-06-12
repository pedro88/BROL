"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BadgeIcon, getRarityColor } from "./badge-icon";
import { RarityBadge, CategoryBadge } from "./badge-card";
import type { BadgeDefinition } from "./badge-icon";

export interface BadgeModalProps {
  badge: BadgeDefinition | null;
  earned?: boolean;
  onClose: () => void;
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

const RARITY_BORDER_COLORS: Record<string, string> = {
  COMMON: "border-muted",
  UNCOMMON: "border-green-500/50",
  RARE: "border-blue-500/50",
  EPIC: "border-purple-500/50",
  LEGENDARY: "border-amber-500/50",
};

export function BadgeModal({ badge, earned = false, onClose }: BadgeModalProps) {
  useEffect(() => {
    if (badge) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [badge]);

  if (!badge) return null;

  const rarity = badge.rarity || "COMMON";
  const borderColor = RARITY_BORDER_COLORS[rarity] || RARITY_BORDER_COLORS.COMMON;
  const rarityColor = getRarityColor(rarity);

  return (
    <Dialog open={!!badge} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`max-w-sm overflow-hidden p-0 border-2 ${borderColor}`}>
        <div className="p-6 pt-8 text-center">
          <div
            className="inline-flex items-center justify-center rounded-2xl p-4 mb-4 animate-badge-pop"
            style={{
              boxShadow: `0 0 20px ${rarityColor}40`,
            }}
          >
            <BadgeIcon
              badge={badge}
              size="xl"
              earned={earned}
              showRarityGlow={earned}
            />
          </div>

          <DialogTitle className="font-display text-2xl vhs-text-glow mb-1">
            {badge.name}
          </DialogTitle>

          <div className="flex items-center justify-center gap-2 mb-4">
            <RarityBadge rarity={rarity} size="md" />
            {badge.category && <CategoryBadge category={badge.category} size="md" />}
          </div>

          <DialogDescription className="text-sm text-foreground/90 max-w-xs mx-auto">
            {badge.description}
          </DialogDescription>
        </div>

        <div className="p-4 space-y-3">
          {earned ? (
            <div className="text-center">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Décroché le
              </p>
              <p className="font-display text-primary">{formatDate(new Date())}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Comment débloquer ?
              </p>
              <p className="text-sm text-primary/80">
                {badge.unlockHint || "Accomplissez les conditions requises"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}