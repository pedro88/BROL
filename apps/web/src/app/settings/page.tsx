"use client";

import { Header, Navigation } from "../../components/navigation";

/**
 * Page des paramètres.
 */
export default function SettingsPage() {
  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="font-display text-3xl vhs-text-glow text-primary">
          PARAMÈTRES
        </h1>
        <p className="font-mono text-sm text-muted-foreground mt-2">
          Page des paramètres - en construction
        </p>
      </main>

      <Navigation />
    </div>
  );
}
