"use client";

import { useMemo } from "react";

const MOBILE_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

function getUserAgent(): string {
  if (typeof window === "undefined") return "";
  return window.navigator.userAgent;
}

/**
 * Hook pour détecter si l'utilisateur est sur un appareil mobile.
 * Utilise navigator.userAgent — côté client uniquement.
 */
export function useUserAgent() {
  const isMobile = useMemo(() => {
    return MOBILE_REGEX.test(getUserAgent());
  }, []);

  return { isMobile };
}