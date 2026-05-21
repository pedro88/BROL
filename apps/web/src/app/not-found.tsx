/**
 * Page 404 personnalisée.
 *
 * Évite le crash de prerender Next 15 / React 19 sur la page /_error par défaut
 * (le rendu auto de /404 par Next essaie d'utiliser un Context dans un contexte
 * où aucun Provider n'est monté).
 *
 * Cette page est rendue côté serveur (pas de "use client"), donc 100% safe au build.
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-mono text-6xl">404</h1>
      <p className="text-lg">Cette page n&apos;existe pas.</p>
      <Link
        href="/"
        className="rounded border border-current px-4 py-2 font-mono text-sm hover:opacity-70"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
