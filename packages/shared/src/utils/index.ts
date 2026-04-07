/**
 * Utilitaires partagés pour Brol.
 * @package @brol/shared
 */

import type { Locale } from "../types";

/**
 * Génère une URL canonique pour un objet scannable.
 * @param objectId - L'ID de l'objet
 * @returns L'URL canonique du QR code
 */
export function getObjectScanUrl(objectId: string): string {
  return `https://brol.app/s/${objectId}`;
}

/**
 * Génère une URL canonique pour un profil utilisateur.
 * @param userId - L'ID de l'utilisateur
 * @returns L'URL canonique du QR code profil
 */
export function getProfileScanUrl(userId: string): string {
  return `https://brol.app/p/${userId}`;
}

/**
 * Extrait l'ID depuis une URL de scan.
 * @param url - L'URL du QR code
 * @returns L'ID extrait ou null si invalide
 */
export function parseScanUrl(url: string): { type: "object" | "profile"; id: string } | null {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;

    const objectMatch = path.match(/^\/s\/([a-zA-Z0-9]+)$/);
    if (objectMatch && objectMatch[1]) {
      return { type: "object", id: objectMatch[1] };
    }

    const profileMatch = path.match(/^\/p\/([a-zA-Z0-9]+)$/);
    if (profileMatch && profileMatch[1]) {
      return { type: "profile", id: profileMatch[1] };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Formate une date selon la locale.
 * @param date - La date à formater
 * @param locale - La locale (fr, nl, en)
 * @returns La date formatée
 */
export function formatDate(date: Date | string, locale: Locale = "fr"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Formate une date courte selon la locale.
 * @param date - La date à formater
 * @param locale - La locale (fr, nl, en)
 * @returns La date formatée courte
 */
export function formatDateShort(date: Date | string, locale: Locale = "fr"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Calcule le nombre de jours entre deux dates.
 * @param date1 - Première date
 * @param date2 - Deuxième date
 * @returns Le nombre de jours (peut être négatif)
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Vérifie si une date est dépassée.
 * @param date - La date à vérifier
 * @returns true si la date est dans le passé
 */
export function isOverdue(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

/**
 * Génère un code de scan aléatoire pour les QR codes de stock.
 * @returns Un code hexadécimal de 12 caractères
 */
export function generateScanCode(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 12; i++) {
    const index = Math.floor(Math.random() * chars.length);
    code += chars[index] ?? "";
  }
  return code;
}

/**
 * Valide un numéro ISBN-10 ou ISBN-13.
 * @param isbn - Le numéro ISBN à valider
 * @returns true si valide
 */
export function isValidISBN(isbn: string): boolean {
  // Supprimer les tirets et espaces
  const clean = isbn.replace(/[-\s]/g, "");

  // ISBN-10
  if (clean.length === 10) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      const digit = clean[i];
      if (digit) {
        sum += parseInt(digit, 10) * (10 - i);
      }
    }
    const lastChar = clean[9];
    const check = lastChar?.toUpperCase() === "X" ? 10 : parseInt(lastChar ?? "", 10);
    sum += check;
    return sum % 11 === 0;
  }

  // ISBN-13
  if (clean.length === 13) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = clean[i];
      if (digit) {
        sum += parseInt(digit, 10) * (i % 2 === 0 ? 1 : 3);
      }
    }
    const lastDigit = clean[12];
    const check = (10 - (sum % 10)) % 10;
    return check === parseInt(lastDigit ?? "", 10);
  }

  return false;
}

/**
 * Tronque une chaîne de caractères.
 * @param str - La chaîne à tronquer
 * @param maxLength - Longueur maximale
 * @returns La chaîne tronquée avec ellipsis si nécessaire
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Slugifie une chaîne pour les URLs.
 * @param str - La chaîne à slugifier
 * @returns Le slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Obtenir la locale par défaut du navigateur.
 * @returns La locale ou 'fr' par défaut
 */
export function getBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "fr";

  const browserLang = navigator.language.split("-")[0];
  if (browserLang && ["fr", "nl", "en"].includes(browserLang)) {
    return browserLang as Locale;
  }
  return "fr";
}

/**
 * Debounce une fonction.
 * @param fn - La fonction à debounce
 * @param delay - Le délai en ms
 * @returns La fonction debounced
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Classe conditionnelle pour Tailwind.
 * @param condition - Condition booléenne
 * @param className - Classes à appliquer si true
 * @returns Classes conditionnelles
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
