"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header, Navigation } from "../../../../components/navigation";
import { EditObjectDialog } from "../../../../components/objects/edit-object-dialog";
import { trpc } from "../../../../lib/trpc";

/**
 * Page d'édition d'un objet.
 * Protégée — nécessite authentification (middleware).
 */
export default function EditObjectPage() {
  const params = useParams();
  const router = useRouter();
  const objectId = params.id as string;
  const [dialogOpen, setDialogOpen] = useState(true);

  const { data: object, isLoading } = trpc.objects.get.useQuery(
    { id: objectId },
    { enabled: !!objectId }
  );

  const handleSuccess = () => {
    router.push(`/objects/${objectId}`);
  };

  const handleClose = () => {
    router.push(`/objects/${objectId}`);
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Back button */}
        <Link
          href={`/objects/${objectId}`}
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Détail de l&apos;objet
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl vhs-text-glow text-primary">
            MODIFIER
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">
            Modifier les informations de l&apos;objet
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {/* Dialog */}
        {!isLoading && object && (
          <EditObjectDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) handleClose();
            }}
            objectId={objectId}
            objectName={object.name}
            initialData={{
              name: object.name,
              author: object.author,
              edition: object.edition,
              condition: object.condition,
              notes: object.notes,
            }}
            onSuccess={handleSuccess}
          />
        )}

        {/* Not found state */}
        {!isLoading && !object && (
          <div className="card-vhs p-8 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              Objet non trouvé.
            </p>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}