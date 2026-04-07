"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, BookOpen, Pencil, Trash2 } from "lucide-react";
import { Header, Navigation } from "../../../components/navigation";
import { Button } from "../../../components/ui/button";
import { ObjectCard } from "../../../components/objects/object-card";
import { trpc } from "../../../lib/trpc";
import type { AppRouter } from "@brol/api";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type CollectionObject = RouterOutputs["collections"]["get"]["objects"][number];

type ObjectWithLoans = RouterOutputs["collections"]["get"]["objects"][number];

// Transform tRPC object to ObjectCard format
function transformObject(obj: CollectionObject) {
  const activeLoan = obj.loans?.find((l: { status: string }) => l.status === "ACTIVE");
  return {
    id: obj.id,
    name: obj.name,
    author: obj.author,
    condition: obj.condition,
    currentLoan: activeLoan
      ? {
          id: activeLoan.id,
          borrower: activeLoan.borrower,
          returnDueDate: activeLoan.returnDueDate?.toISOString(),
        }
      : null,
  };
}

/**
 * Page de détail d'une collection.
 * Affiche les informations de la collection et ses objets.
 */
export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  // Fetch collection details
  const { data: collection, isLoading } = trpc.collections.get.useQuery(
    { id: collectionId },
    { enabled: !!collectionId }
  );

  // Mock data for demo
  const mockCollection = {
    id: collectionId,
    name: "Ma Bibliothèque",
    description: "Romans et BD de ma collection personnelle",
    coverImage: null as string | null,
    objects: [
      {
        id: "obj1",
        name: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        condition: "GOOD" as const,
        loans: [],
      },
      {
        id: "obj2",
        name: "Astérix le Gaulois",
        author: "Goscinny & Uderzo",
        condition: "LIKE_NEW" as const,
        loans: [
          {
            id: "loan1",
            status: "ACTIVE" as const,
            borrower: { id: "b1", name: "Jean Dupont", avatarUrl: null },
            returnDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        id: "obj3",
        name: "Python Crash Course",
        author: "Eric Matthes",
        condition: "FAIR" as const,
        loans: [],
      },
    ] as ObjectWithLoans[],
  };

  const collectionData = collection ?? mockCollection;
  const objects = collectionData.objects?.map(transformObject) ?? [];
  const loanedCount = objects.filter((o: ReturnType<typeof transformObject>) => o.currentLoan).length;

  // Delete mutation
  const deleteMutation = trpc.collections.delete.useMutation({
    onSuccess: () => {
      router.push("/collections");
    },
  });

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette collection ? Cette action est irréversible.")) {
      deleteMutation.mutate({ id: collectionId });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Back button */}
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Collections
        </Link>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {/* Collection content */}
        {!isLoading && collectionData && (
          <>
            {/* Collection header */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="font-display text-3xl vhs-text-glow text-primary">
                    {collectionData.name}
                  </h1>
                  {collectionData.description && (
                    <p className="font-mono text-sm text-muted-foreground mt-2">
                      {collectionData.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/collections/${collectionId}/edit`}>
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 mt-4">
                <div className="card-vhs px-4 py-2">
                  <span className="font-display text-2xl text-primary">
                    {objects.length}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground ml-2">
                    objets
                  </span>
                </div>
                <div className="card-vhs px-4 py-2">
                  <span className="font-display text-2xl text-secondary">
                    {loanedCount}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground ml-2">
                    prêtés
                  </span>
                </div>
              </div>
            </div>

            {/* Add object button */}
            <div className="mb-4">
              <Button asChild className="w-full">
                <Link href={`/objects/add?collectionId=${collectionId}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un objet
                </Link>
              </Button>
            </div>

            {/* Objects list */}
            {objects.length === 0 && (
              <div className="card-vhs p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="font-display text-xl text-muted-foreground mb-2">
                  AUCUN OBJET
                </h2>
                <p className="font-mono text-sm text-muted-foreground">
                  Ajoutez votre premier objet à cette collection
                </p>
              </div>
            )}

            {objects.length > 0 && (
              <div className="space-y-3">
                {objects.map((object) => (
                  <ObjectCard
                    key={object.id}
                    id={object.id}
                    name={object.name}
                    author={object.author}
                    condition={object.condition}
                    currentLoan={object.currentLoan}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Navigation />
    </div>
  );
}
