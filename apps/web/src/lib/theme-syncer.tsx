"use client";

/**
 * Synchronise le thème graphique avec `User.theme` une fois l'utilisateur
 * connecté → le thème suit l'utilisateur entre appareils, même sans cookie
 * `brol_theme` local (nouvel appareil, navigation privée).
 *
 * Monté une fois dans Providers. Ne fait rien tant qu'aucun token de session.
 *
 * @package @brol/web
 */

import { useEffect, useSyncExternalStore } from "react";
import { trpc } from "./trpc";
import { sessionTokenStore, getSessionToken } from "./auth-store";
import { applyTheme, asThemeId, currentThemeId } from "./theme";

export function ThemeSyncer() {
  const token = useSyncExternalStore(
    (cb) => sessionTokenStore.subscribe(cb),
    () => getSessionToken(),
    () => undefined,
  );

  const { data } = trpc.users.me.useQuery(undefined, { enabled: !!token });

  useEffect(() => {
    if (!data) return;
    const id = asThemeId(data.theme);
    // N'écrase l'affichage que si le serveur diverge (le cookie a déjà gagné
    // au SSR pour le cas courant).
    if (id !== currentThemeId()) applyTheme(id);
  }, [data]);

  return null;
}
