"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Clock,
  User,
  BookOpen,
  QrCode,
  Download,
  Printer,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Header, Navigation } from "../../../components/navigation";
import { Button } from "../../../components/ui/button";
import { trpc } from "../../../lib/trpc";
import { AssignQrDialog } from "../../../components/qr/assign-qr-dialog";
import {
  QrCodeImage,
  useQrDownload,
} from "../../../components/qr/qr-code-image";
import { CreateLoanDialog } from "../../../components/loans/create-loan-dialog";
import { PhotoGallery } from "../../../components/photos/photo-gallery";
import { ContactOwnerDialog } from "../../../components/objects/contact-owner-dialog";
import { toast } from "sonner";

/**
 * Page de détail d'un objet.
 * Protégée — nécessite authentification (middleware).
 */
export default function ObjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const objectId = params.id as string;

  // On lance les 2 queries en parallèle :
  // - `objects.get` (protectedProcedure) renvoie l'objet seulement si on
  //   en est propriétaire. Renvoie `null` sinon (pas de throw). Sert au
  //   chemin "owner" complet avec loans + qrStock.
  // - `objects.getPublic` (publicProcedure) renvoie toujours quelque chose
  //   pour les objets existants : vue publique anonyme, ou enrichie si on
  //   a un contact lié au owner. Sert au fallback non-owner.
  // Si le user est anonyme au moment du fire (race entre AuthSessionSyncer
  // et le mount), `get` reviendra avec UNAUTHORIZED et React Query re-tente
  // une fois le token sync — du coup le owner finit toujours par voir sa
  // vue complète.
  const { data: privateObject, isLoading: isLoadingPrivate } =
    trpc.objects.get.useQuery(
      { id: objectId },
      { enabled: !!objectId, retry: 2 },
    );
  const { data: publicObject, isLoading: isLoadingPublic } =
    trpc.objects.getPublic.useQuery(
      { id: objectId },
      { enabled: !!objectId && !privateObject, retry: 2 },
    );

  const utils = trpc.useUtils();

  const isOwner = !!privateObject;
  const object: typeof privateObject | typeof publicObject | null | undefined =
    privateObject ?? publicObject;
  const isLoading = isLoadingPrivate || (!privateObject && isLoadingPublic);
  const viaContact =
    !isOwner && (publicObject?.viaContact ?? false);
  const isBorrower = !isOwner && (publicObject?.isBorrower ?? false);
  const myActiveLoan =
    !isOwner ? (publicObject?.myActiveLoan ?? null) : null;
  const ownerName = !isOwner ? (publicObject?.owner?.name ?? null) : null;
  const ownerHandle = !isOwner ? (publicObject?.owner?.handle ?? null) : null;
  const ownerIdForContact = !isOwner ? (publicObject?.owner?.id ?? null) : null;

  const [assignQrOpen, setAssignQrOpen] = useState(false);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const { downloadPng, printQr } = useQrDownload(
    process.env.NEXT_PUBLIC_APP_URL,
  );

  const deleteMutation = trpc.objects.delete.useMutation({
    onSuccess: () => {
      const collectionId =
        privateObject?.collectionId ??
        privateObject?.collection?.id ??
        publicObject?.collection?.id ??
        "";
      router.push(`/collections/${collectionId}`);
    },
  });

  // Permet à l'owner de clôturer un prêt actif directement depuis la page
  // détail objet (utile post-scan QR du propre objet).
  const returnLoanMutation = trpc.loans.return.useMutation({
    onSuccess: () => {
      utils.objects.get.invalidate({ id: objectId });
      utils.objects.getPublic.invalidate({ id: objectId });
      toast.success("Prêt clôturé");
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de clôturer le prêt");
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

  // `loans` + `qrStock` viennent uniquement du chemin owner.
  const ownerView = (privateObject ?? {}) as Partial<{
    loans: Array<{
      id: string;
      status: string;
      returnDueDate: Date | string | null;
      borrower: { id: string; name: string | null } | null;
    }>;
    qrStock: { code: string } | null;
    notes: string | null;
    brand: string | null;
  }>;
  const currentLoan = ownerView.loans?.[0];
  const hasActiveLoan = currentLoan?.status === "ACTIVE";
  const pastLoans = ownerView.loans?.slice(1) ?? [];
  const qrStock = ownerView.qrStock ?? null;

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Back button */}
        <Link
          href={isOwner ? `/collections/${object.collection?.id ?? ""}` : "/objects"}
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {isOwner ? (object.collection?.name ?? "Collection") : "Retour"}
        </Link>

        {/* Bandeau borrower — caller a un prêt ACTIVE/OVERDUE sur cet objet */}
        {isBorrower && myActiveLoan && (
          <div className="card-vhs border-primary/40 p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs uppercase text-primary tracking-wider">
                Vous avez emprunté cet objet
              </span>
            </div>
            <p className="font-mono text-sm text-muted-foreground">
              Depuis le{" "}
              {new Date(myActiveLoan.lentAt).toLocaleDateString("fr-BE")}
              {myActiveLoan.returnDueDate && (
                <>
                  {" "}— retour prévu le{" "}
                  {new Date(myActiveLoan.returnDueDate).toLocaleDateString(
                    "fr-BE",
                  )}
                </>
              )}
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              Propriétaire :{" "}
              <span className="text-secondary">
                {ownerName ?? "Inconnu"}
                {ownerHandle ? ` #${ownerHandle}` : ""}
              </span>
            </p>
          </div>
        )}

        {/* Owner badge — visible quand la vue n'est pas la nôtre et pas
            borrower (le bandeau borrower ci-dessus inclut déjà l'owner). */}
        {!isOwner && !isBorrower && (
          <div className="card-vhs border-secondary/30 p-3 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-secondary" />
            <span className="font-mono text-xs text-muted-foreground">
              {viaContact ? "Via votre contact" : "Objet partagé"}
            </span>
            <span className="font-mono text-sm text-secondary">
              {ownerName ?? "Inconnu"}
              {ownerHandle ? ` #${ownerHandle}` : ""}
            </span>
          </div>
        )}

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

            {isOwner && (
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
            )}
          </div>

          {/* Condition badge */}
          <div className="mt-4">
            <span className="px-3 py-1 text-sm font-mono border border-primary/50 bg-primary/20 text-primary">
              {conditionLabels[object.condition] ?? object.condition}
            </span>
          </div>
        </div>

        {/* Photo gallery */}
        <div className="mt-6">
          <PhotoGallery objectId={objectId} coverImage={object.coverImage} />
        </div>

        {/* Details */}
        <div className="card-vhs p-4 space-y-4">
          {object.edition && (
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">
                Édition
              </p>
              <p className="font-mono text-sm">{object.edition}</p>
            </div>
          )}

          {object.isbn && (
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">
                ISBN
              </p>
              <p className="font-mono text-sm">{object.isbn}</p>
            </div>
          )}

          {ownerView.notes && (
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">
                Notes
              </p>
              <p className="font-mono text-sm">{ownerView.notes}</p>
            </div>
          )}

          {ownerView.brand && (
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">
                Marque
              </p>
              <p className="font-mono text-sm">{ownerView.brand}</p>
            </div>
          )}

          {qrStock && (
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">
                QR Code
              </p>
              <p className="font-mono text-sm text-secondary">
                {qrStock.code}
              </p>
            </div>
          )}
        </div>

        {/* Current loan — owner only */}
        {isOwner && hasActiveLoan && currentLoan && (
          <div className="mt-6">
            <h2 className="font-mono text-sm text-muted-foreground uppercase mb-3">
              PRÊT EN COURS
            </h2>
            <div className="card-vhs border-secondary/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-secondary" />
                <span className="font-mono text-sm text-secondary">
                  {currentLoan.borrower?.name}
                </span>
              </div>
              {currentLoan.returnDueDate && (
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">
                    Retour prévu le{" "}
                    {new Date(currentLoan.returnDueDate).toLocaleDateString(
                      "fr-BE",
                    )}
                  </span>
                </div>
              )}
              <Button
                onClick={() =>
                  returnLoanMutation.mutate({ loanId: currentLoan.id })
                }
                disabled={returnLoanMutation.isPending}
                className="w-full gap-2"
                aria-label="Marquer comme retourné"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marquer rendu
              </Button>
            </div>
          </div>
        )}

        {/* Loan history — owner only */}
        {isOwner && pastLoans.length > 0 && (
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
                    <span
                      className={`font-mono text-xs px-2 py-0.5 ${
                        loan.status === "RETURNED"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {loan.status === "RETURNED" ? "Retourné" : loan.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code section — owner only */}
        {isOwner && (qrStock ? (
          <div className="mt-6">
            <h2 className="font-mono text-sm text-muted-foreground uppercase mb-3">
              QR Code
            </h2>
            <div className="card-vhs p-4 flex flex-col items-center gap-4">
              <QrCodeImage
                code={qrStock.code}
                size={180}
                baseUrl={process.env.NEXT_PUBLIC_APP_URL}
              />
              <div className="w-full space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      qrStock &&
                      downloadPng(qrStock.code, object.name)
                    }
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger PNG
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      qrStock &&
                      printQr(qrStock.code, object.name)
                    }
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                  </Button>
                </div>
                <p className="font-mono text-xs text-muted-foreground text-center">
                  {qrStock.code}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <h2 className="font-mono text-sm text-muted-foreground uppercase mb-3">
              QR Code
            </h2>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setAssignQrOpen(true)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Assigner un QR code
            </Button>
          </div>
        ))}

        {/* Actions — owner only. La demande communauté se fait depuis le dashboard. */}
        {isOwner && (
          <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLoanDialogOpen(true)}
            >
              <User className="w-4 h-4 mr-2" />
              {hasActiveLoan ? "Prêt en cours" : "Prêter cet objet"}
            </Button>
          </div>
        )}

        {/* Contacter le propriétaire — visible en vue anon ou viaContact,
            principalement utile au tiers qui scanne un QR sur un objet
            trouvé/perdu. Pas affiché côté borrower : il a déjà un canal
            direct via son prêt actif. */}
        {!isOwner && !isBorrower && object && ownerIdForContact && (
          <div className="mt-6">
            <ContactOwnerDialog
              objectId={objectId}
              ownerId={ownerIdForContact}
              ownerName={ownerName ?? "le propriétaire"}
              objectName={object.name}
              trigger={
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  Contacter le propriétaire
                </Button>
              }
            />
          </div>
        )}
      </main>

      <Navigation />

      {isOwner && (
        <>
          <CreateLoanDialog
            open={loanDialogOpen}
            onOpenChange={setLoanDialogOpen}
            objectId={objectId}
            objectName={object.name}
          />

          <AssignQrDialog
            open={assignQrOpen}
            onOpenChange={setAssignQrOpen}
            objectId={objectId}
            objectName={object.name}
          />
        </>
      )}
    </div>
  );
}
