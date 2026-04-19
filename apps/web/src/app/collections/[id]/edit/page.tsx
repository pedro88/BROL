"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header, Navigation } from "../../../../components/navigation";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { trpc } from "../../../../lib/trpc";

/**
 * Page d'édition d'une collection.
 */
export default function EditCollectionPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  // Fetch collection
  const { data: collection, isLoading } = trpc.collections.get.useQuery(
    { id: collectionId },
    { enabled: !!collectionId }
  );

  // Update mutation
  const updateMutation = trpc.collections.update.useMutation({
    onSuccess: () => {
      router.push(`/collections/${collectionId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: collectionId,
      data: {
        name: formData.get("name") as string,
        description: formData.get("description") as string || undefined,
      },
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Back button */}
        <Link
          href={`/collections/${collectionId}`}
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Collection
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl vhs-text-glow text-primary">
            MODIFIER
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">
            Modifier les informations de la collection
          </p>
        </div>

        {/* Form */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        ) : collection ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-mono text-xs uppercase">
                Nom *
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={collection.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-mono text-xs uppercase">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                defaultValue={collection.description ?? ""}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        ) : (
          <p className="font-mono text-muted-foreground">Collection non trouvée</p>
        )}
      </main>

      <Navigation />
    </div>
  );
}
