"use client";

import { Header, Navigation } from "@/components/navigation";
import { RequestsList } from "@/components/requests/requests-list";

export default function RequestsPage() {
  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="font-display text-2xl vhs-text-glow text-primary mb-6">
          DEMANDES À LA COMMUNAUTÉ
        </h1>
        <RequestsList />
      </main>
      <Navigation />
    </div>
  );
}
