/**
 * Configuration de requête next-intl — SANS routing par préfixe d'URL.
 * La locale est résolue à chaque requête depuis le cookie `brol_locale`,
 * avec repli sur l'en-tête Accept-Language puis la locale par défaut.
 *
 * @package @brol/web
 */

import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALES,
  getMessages,
  isLocale,
  type Locale,
} from "@brol/shared";

/** Nom du cookie portant la préférence de langue (posé par le switcher). */
export const LOCALE_COOKIE = "brol_locale";

/** Devine la locale depuis Accept-Language (première correspondance supportée). */
function fromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (isLocale(tag)) return tag;
  }
  return null;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale: Locale;
  if (isLocale(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const headerStore = await headers();
    locale = fromAcceptLanguage(headerStore.get("accept-language")) ?? DEFAULT_LOCALE;
  }

  // Garde-fou : ne jamais renvoyer une locale non supportée.
  if (!LOCALES.includes(locale)) locale = DEFAULT_LOCALE;

  return { locale, messages: getMessages(locale) as unknown as import("next-intl").AbstractIntlMessages };
});
