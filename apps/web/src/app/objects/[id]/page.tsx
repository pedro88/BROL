"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Clock, User, BookOpen } from "lucide-react";
import { Header, Navigation } from "../../../components/navigation";
import { Button } from "../../../components/ui/button";
import { trpc } from "../../../lib/trpc";

/**
 * Page de détail d'un objet.
 * Protégée — nécessite authentification (middleware).
 */
export default function ObjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const objectId = params.id as string;

  const { data: object, isLoading } = trpc.objects.get.useQuery(
    { id: objectId },
    { enabled: !!objectId }
  );

  const deleteMutation = trpc.objects.delete.useMutation({
    onSuccess: () => {
      router.push(`/collections/${object?.collectionId}`);
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

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="px-4 py-6 max-w-lg mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        </main>
        <Navigation />
      </div>
    );
  }

  if (!object) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="px-4 py-6 max-w-lg mx-auto">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Collections
          </Link>
          <div className="card-vhs p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-xl text-muted-foreground mb-2">
              OBJET NON TROUVÉ
            </h2>
            <p className="font-mono text-sm text-muted-foreground">
              Cet objet n&apos;existe pas ou ne vous appartient pas.
            </p>
          </div>
        </main>
        <Navigation />
      </div>
    );
  }

  const currentLoan = object.loans?.[0];
  const pastLoans = object.loans?.slice(1) ?? [];

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Back button */}
        <Link
          href={`/collections/${object.collectionId}`}
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {object.collection?.name ?? "Collection"}
        </Link>

        {/* Object header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="font-display text-3xl vhs-text-glow text-primary">
                {object.name}
              </h1>
              {object.author && (
                <p className="font-mono text-sm text-muted-foreground mt-2">
                  {object.author}
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
              {conditionLabels[object.condition] ?? object.condition}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="card-vhs p-4 space-y-4">
          {object.edition && (
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">Édition</p>
              <p className="font-mono text-sm">{object.edition}</p>
            </div>
          )}

          {object.isbn && (
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">ISBN</p>
              <p className="font-mono text-sm">{object.isbn}</p>
            </div>
          )}

          {object.notes && (
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">Notes</p>
              <p className="font-mono text-sm">{object.notes}</p>
            </div>
          )}

          {object.qrStock && (
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">QR Code</p>
              <p className="font-mono text-sm text-secondary">{object.qrStock.code}</p>
            </div>
          )}
        </div>

        {/* Current loan */}
        {currentLoan?.status === "ACTIVE" && (
          <div className="mt-6">
            <h2 className="font-mono text-sm text-muted-foreground uppercase mb-3">
              {/* PRÊT EN COURS */}
            </h2>
            <div className="card-vhs border-secondary/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-secondary" />
                <span className="font-mono text-sm text-secondary">
                  {currentLoan.borrower?.name}
                </span>
              </div>
              {currentLoan.returnDueDate && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">
                    Retour prévu le {new Date(currentLoan.returnDueDate).toLocaleDateString("fr-BE")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loan history */}
        {pastLoans.length > 0 && (
          <div className="mt-6">
            <h2 className="font-mono text-sm text-muted-foreground uppercase mb-3">
              {/* HISTORIQUE */}
            </h2>
            <div className="space-y-2">
              {pastLoans.map((loan) => (
                <div key={loan.id} className="card-vhs p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">
                      {loan.borrower?.name}
                    </span>
                    <span className={`font-mono text-xs px-2 py-0.5 ${
                      loan.status === "RETURNED" ? "bg-green-500/20 text-green-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {loan.status === "RETURNED" ? "Retourné" : loan.status}
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
      </main>

      <Navigation />
    </div>
  );
}