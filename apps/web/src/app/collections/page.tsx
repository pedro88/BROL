"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { Header, Navigation } from "../../components/navigation";
import { CollectionCard } from "../../components/collections/collection-card";
import { CreateCollectionDialog } from "../../components/collections/create-collection-dialog";
import { Button } from "../../components/ui/button";
import { trpc } from "../../lib/trpc";

/**
 * Page des collections.
 * Affiche la liste des collections de l'utilisateur.
 */
export default function CollectionsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const utils = trpc.useUtils();

  // Fetch collections (auth is required — middleware redirects here)
  const { data: collectionsData, isLoading } = trpc.collections.list.useQuery(
    undefined
  );

  const collections = collectionsData?.items ?? [];

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Header avec action */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl vhs-text-glow text-primary">
              COLLECTIONS
            </h1>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              {collections.length} collection{collections.length !== 1 ? "s" : ""}
            </p>
          </div>

          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle
          </Button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && collections.length === 0 && (
          <div className="card-vhs p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-xl text-muted-foreground mb-2">
              AUCUNE COLLECTION
            </h2>
            <p className="font-mono text-sm text-muted-foreground mb-4">
              Créez votre première collection pour commencer
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une collection
            </Button>
          </div>
        )}

        {/* Collections grid */}
        {!isLoading && collections.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                id={collection.id}
                name={collection.name}
                description={collection.description}
                coverImage={collection.coverImage}
                objectCount={collection.objectCount}
              />
            ))}

            {/* Add new card */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="card-vhs aspect-[4/3] flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-border group-hover:border-primary flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">
                Ajouter
              </span>
            </button>
          </div>
        )}
      </main>

      <Navigation />

      {/* Create collection dialog */}
      <CreateCollectionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          utils.collections.list.invalidate();
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
}
