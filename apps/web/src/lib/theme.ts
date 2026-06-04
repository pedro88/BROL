/**
 * Helpers de thème graphique partagés client/serveur.
 *
 * Le choix vit dans le cookie `brol_theme` (lisible côté serveur → `data-theme`
 * rendu dans le layout, pas de FOUC ni de mismatch d'hydratation) ET, pour les
 * utilisateurs connectés, dans `User.theme` (suit l'appareil via tRPC).
 *
 * "magenta" = défaut : aucun attribut `data-theme` (les variables `:root` de
 * globals.css s'appliquent).
 *
 * @package @brol/web
 */

import { THEMES } from "@brol/shared";

export type ThemeId = (typeof THEMES)[number];

/** Doit rester aligné avec la lecture serveur dans app/layout.tsx. */
export const THEME_COOKIE = "brol_theme";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Valide une string arbitraire comme ThemeId (fallback "magenta"). */
export function asThemeId(value: string | null | undefined): ThemeId {
  return THEMES.includes(value as ThemeId) ? (value as ThemeId) : "magenta";
}

/** Valeur de l'attribut `data-theme` pour un id ("" pour le défaut magenta). */
export function themeAttr(id: ThemeId): string {
  return id === "magenta" ? "" : id;
}

/**
 * Applique le thème au document et le persiste dans le cookie. À appeler
 * uniquement côté client.
 */
export function applyTheme(id: ThemeId): void {
  const attr = themeAttr(id);
  const root = document.documentElement;
  if (attr) root.setAttribute("data-theme", attr);
  else root.removeAttribute("data-theme");
  document.cookie = `${THEME_COOKIE}=${id}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
}

/** Lit l'id de thème courant depuis l'attribut `data-theme` du document. */
export function currentThemeId(): ThemeId {
  if (typeof document === "undefined") return "magenta";
  const attr = document.documentElement.getAttribute("data-theme");
  return asThemeId(attr || "magenta");
}
