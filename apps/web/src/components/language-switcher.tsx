"use client";

/**
 * Sélecteur de langue — pose le cookie `brol_locale` et recharge la page
 * pour que la request config next-intl (src/i18n/request.ts) reprojette les
 * messages côté serveur. Pas de préfixe d'URL : la locale vit dans le cookie.
 *
 * @package @brol/web
 */

import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { LOCALES } from "@brol/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

/** Doit rester aligné avec LOCALE_COOKIE dans src/i18n/request.ts. */
const LOCALE_COOKIE = "brol_locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("language");

  function setLocale(next: string) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
    // Hard reload : force le serveur à relire le cookie et reprojeter les
    // messages (les Server Components ne réagissent pas au changement de cookie
    // via un simple router.refresh sur certaines versions).
    window.location.reload();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("label")}
        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors font-mono text-xs uppercase"
      >
        <Globe className="w-4 h-4" strokeWidth={1.5} />
        <span>{locale}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLocale(l)}
            className={l === locale ? "text-primary font-bold" : ""}
          >
            {t(l)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
