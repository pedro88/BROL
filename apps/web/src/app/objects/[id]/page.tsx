"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Clock, User } from "lucide-react";
import { Header, Navigation } from "../../../components/navigation";
import { Button } from "../../../components/ui/button";
import { trpc } from "../../../lib/trpc";

/**
 * Page de détail d'un objet.
 */
export default function ObjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const objectId = params.id as string;

  // Fetch object details
  const { data: object, isLoading } = trpc.objects.get.useQuery(
    { id: objectId },
    { enabled: !!objectId }
  );

  // Mock data for demo
  const mockObject = {
    id: objectId,
    name: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    edition: "Gallimard, 1943",
    isbn: "978-2-07-040850-4",
    condition: "GOOD" as const,
    notes: "Édition de collection, couverture légèrement abîmée",
    collection: {
      id: "col1",
      name: "Ma Bibliothèque",
    },
    loans: [
      {
        id: "loan1",
        status: "ACTIVE" as const,
        borrower: { id: "b1", name: "Jean Dupont" },
        lentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        returnDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    qrStock: {
      code: "qr-abc123",
    },
  };

  const objectData = object ?? mockObject;

  // Delete mutation
  const deleteMutation = trpc.objects.delete.useMutation({
    onSuccess: () => {
      router.push(`/collections/${objectData.collection.id}`);
    },
  });

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet objet ?")) {
      deleteMutation.mutate({ id: objectId });
    }
  };

  const conditionLabels: Record<string, string> = {
    NEW: "Neuf",
    LIKE_NEW: "Comme neuf",
    GOOD: "Bon",
    FAIR: "Correct",
    POOR: "Mauvais",
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Back button */}
        <Link
          href={`/collections/${objectData.collection.id}`}
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {objectData.collection.name}
        </Link>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {/* Object content */}
        {!isLoading && objectData && (
          <>
            {/* Object header */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="font-display text-3xl vhs-text-glow text-primary">
                    {objectData.name}
                  </h1>
                  {objectData.author && (
                    <p className="font-mono text-sm text-muted-foreground mt-2">
                      {objectData.author}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/objects/${objectId}/edit`}>
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

              {/* Condition badge */}
              <div className="mt-4">
                <span className="px-3 py-1 text-sm font-mono border border-primary/50 bg-primary/20 text-primary">
                  {conditionLabels[objectData.condition]}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="card-vhs p-4 space-y-4">
              {objectData.edition && (
                <div>
                  <p className="font-mono text-xs text-muted-foreground uppercase">Édition</p>
                  <p className="font-mono text-sm">{objectData.edition}</p>
                </div>
              )}

              {objectData.isbn && (
                <div>
                  <p className="font-mono text-xs text-muted-foreground uppercase">ISBN</p>
                  <p className="font-mono text-sm">{objectData.isbn}</p>
                </div>
              )}

              {objectData.notes && (
                <div>
                  <p className="font-mono text-xs text-muted-foreground uppercase">Notes</p>
                  <p className="font-mono text-sm">{objectData.notes}</p>
                </div>
              )}

              {objectData.qrStock && (
                <div>
                  <p className="font-mono text-xs text-muted-foreground uppercase">QR Code</p>
                  <p className="font-mono text-sm text-secondary">{objectData.qrStock.code}</p>
                </div>
              )}
            </div>

            {/* Current loan */}
            {objectData.loans?.[0]?.status === "ACTIVE" && (
              <div className="mt-6">
                <h2 className="font-mono text-sm text-muted-foreground uppercase mb-3">
                  // PRÊT EN COURS
                </h2>
                <div className="card-vhs border-secondary/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-secondary" />
                    <span className="font-mono text-sm text-secondary">
                      {objectData.loans[0].borrower.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground">
                      Retour prévu le {new Date(objectData.loans[0].returnDueDate!).toLocaleDateString("fr-BE")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Loan history */}
            {objectData.loans && objectData.loans.length > 0 && (
              <div className="mt-6">
                <h2 className="font-mono text-sm text-muted-foreground uppercase mb-3">
                  // HISTORIQUE
                </h2>
                <div className="space-y-2">
                  {objectData.loans.map((loan) => (
                    <div key={loan.id} className="card-vhs p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-sm">{loan.borrower.name}</span>
                        <span className={`font-mono text-xs px-2 py-0.5 ${
                          loan.status === "ACTIVE" ? "bg-secondary/20 text-secondary" :
                          loan.status === "RETURNED" ? "bg-green-500/20 text-green-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {loan.status === "ACTIVE" ? "Actif" :
                           loan.status === "RETURNED" ? "Retourné" :
                           loan.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button variant="outline" className="w-full">
                <User className="w-4 h-4 mr-2" />
                Prêter cet objet
              </Button>
            </div>
          </>
        )}
      </main>

      <Navigation />
    </div>
  );
}
