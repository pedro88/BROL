/**
 * Page de parcourir les collections publiques.
 * Accessible sans authentification —任何人 peut browses les collections rendues publiques.
 *
 * @package @brol/web
 */

export const dynamic = "force-dynamic";

import Link from "next/link";
import { BookOpen, Globe } from "lucide-react";
import { Header, Navigation } from "../../components/navigation";
import { trpc } from "../../lib/trpc";

/**
 * Page de navigation vers les collections publiques.
 * Affiche la liste de toutes les collections rendues publiques.
 */
export default function BrowsePage() {
  const { data, isLoading } = trpc.collections.listPublic.useQuery(undefined, {
    staleTime: 30_000,
  });

  const collections = data?.items ?? [];

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              &gt; Browse_
            </span>
          </div>
          <h1 className="font-display text-3xl vhs-text-glow text-primary">
            COLLECTIONS PUBLIQUES
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {isLoading
              ? "Chargement..."
              : `${collections.length} collection${collections.length !== 1 ? "s" : ""} publique${collections.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && collections.length === 0 && (
          <div className="card-vhs p-8 text-center">
            <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-xl text-muted-foreground mb-2">
              AUCUNE COLLECTION PUBLIQUE
            </h2>
            <p className="font-mono text-sm text-muted-foreground">
              Les collections rendues publiques apparaîtront ici.
            </p>
          </div>
        )}

        {/* Collections list */}
        {!isLoading && collections.length > 0 && (
          <div className="space-y-4">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className="card-vhs block p-4 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  {/* Cover or placeholder */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-sm overflow-hidden bg-muted flex items-center justify-center">
                    {collection.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={collection.coverImage}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-lg group-hover:text-primary transition-colors truncate">
                      {collection.name}
                    </h2>
                    {collection.description && (
                      <p className="font-mono text-xs text-muted-foreground line-clamp-2 mt-1">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {collection.ownerName && (
                        <span className="font-mono text-xs text-muted-foreground">
                          par {collection.ownerName}
                        </span>
                      )}
                      <span className="font-mono text-xs text-muted-foreground">
                        {collection.objectCount} objet{collection.objectCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}