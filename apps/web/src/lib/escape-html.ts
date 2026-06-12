/**
 * Échappe une string pour interpolation dans un template HTML construit à la
 * main (flux d'impression QR via document.write). À utiliser pour TOUTE
 * donnée utilisateur (noms d'objets...) injectée dans du HTML string.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
