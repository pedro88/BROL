"use client";

/**
 * Section "Apparence" de la page Paramètres — choix du thème graphique.
 * Applique le preset instantanément (variables CSS), pose le cookie
 * `brol_theme` et persiste sur `User.theme` (suit l'utilisateur entre
 * appareils).
 *
 * @package @brol/web
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { THEMES } from "@brol/shared";
import { trpc } from "@/lib/trpc";
import { getSessionToken } from "@/lib/auth-store";
import { applyTheme, asThemeId, type ThemeId } from "@/lib/theme";

/** Aperçu couleur (primary / secondary) par preset, pour les pastilles. */
const SWATCHES: Record<ThemeId, [string, string]> = {
  magenta: ["#ff00ff", "#00ffff"],
  cyan: ["#00ffff", "#ff00ff"],
  "crt-amber": ["#ffb000", "#cc7a00"],
  boring: ["#2563eb", "#e5e7eb"],
};

/** id de thème → clé i18n du namespace "theme". */
const LABEL_KEYS: Record<ThemeId, string> = {
  magenta: "magenta",
  cyan: "cyan",
  "crt-amber": "crtAmber",
  boring: "boring",
};

export function ThemeSection({ initialTheme }: { initialTheme: string | null | undefined }) {
  const t = useTranslations("theme");
  const [current, setCurrent] = useState<ThemeId>(asThemeId(initialTheme));
  const updateTheme = trpc.users.updateTheme.useMutation();

  function selectTheme(id: ThemeId) {
    if (id === current) return;
    applyTheme(id);
    setCurrent(id);
    // Best-effort : le cookie suffit à l'affichage ; le persist sert au suivi
    // cross-appareils. On ignore l'échec réseau.
    if (getSessionToken()) {
      updateTheme.mutate({ theme: id });
    }
  }

  return (
    <div className="card-vhs p-6 space-y-4">
      <h2 className="text-lg font-display uppercase text-primary">{t("label")}</h2>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((id) => {
          const [c1, c2] = SWATCHES[id];
          const active = id === current;
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectTheme(id)}
              aria-pressed={active}
              className={`flex items-center justify-between gap-2 border-2 px-3 py-2.5 rounded-sm font-mono text-sm transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-border text-foreground hover:border-primary/50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="flex">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ background: c1 }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 -ml-1"
                    style={{ background: c2 }}
                  />
                </span>
                {t(LABEL_KEYS[id])}
              </span>
              {active && <Check className="w-4 h-4 shrink-0" strokeWidth={2} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
