"use client";

/**
 * Page d'erreur globale — capture les erreurs non gérées au niveau racine.
 * Doit être un client component avec son propre <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", padding: "2rem", textAlign: "center", fontFamily: "monospace" }}>
        <h1 style={{ fontSize: "3rem" }}>Erreur</h1>
        <p>Une erreur inattendue est survenue.</p>
        <button onClick={reset} style={{ padding: "0.5rem 1rem", border: "1px solid currentColor", background: "transparent", cursor: "pointer" }}>
          Réessayer
        </button>
      </body>
    </html>
  );
}
