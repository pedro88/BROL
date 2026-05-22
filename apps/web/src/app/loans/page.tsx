"use client";

import { useState } from "react";
import { Header, Navigation } from "../../components/navigation";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { CreateLoanDialog } from "../../components/loans/create-loan-dialog";
import { Input } from "../../components/ui/input";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";
import {
  Plus,
  Repeat,
  AlertCircle,
  CheckCircle2,
  Clock,
  Bell,
  ArrowRight,
  Package,
  Search,
  X,
} from "lucide-react";

type Tab = "lent" | "borrowed" | "history";

const TABS: { id: Tab; label: string }[] = [
  { id: "lent", label: "Prêtés" },
  { id: "borrowed", label: "Empruntés" },
  { id: "history", label: "Historique" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "OVERDUE" || status === "OVERDUE") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-mono uppercase">
        <AlertCircle className="w-3 h-3" />
        En retard
      </span>
    );
  }
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase">
        <Clock className="w-3 h-3" />
        Actif
      </span>
    );
  }
  if (status === "RETURNED") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-mono uppercase">
        <CheckCircle2 className="w-3 h-3" />
        Rendu
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-mono uppercase">
        Annulé
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-mono uppercase">
      {status}
    </span>
  );
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < -1)
    return `En retard de ${Math.abs(days)} jour${Math.abs(days) !== 1 ? "s" : ""}`;
  if (days === -1) return "En retard d'un jour";
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  if (days <= 7) return `Dans ${days} jours`;
  return formatDate(date);
}

interface LoanCardProps {
  loan: {
    id: string;
    object: { id: string; name: string; coverImage?: string | null };
    owner?: { id: string; name?: string | null; image?: string | null } | null;
    borrower?: {
      id: string;
      name?: string | null;
      image?: string | null;
    } | null;
    status: string;
    computedStatus: string;
    returnDueDate: Date | string | null;
    lentAt: Date | string;
    returnedAt: Date | string | null;
    reminderSentAt: Date | string | null;
    notes?: string | null;
  };
  viewAs: "owner" | "borrower";
  onReturn?: (id: string) => void;
  onRemind?: (id: string) => void;
}

function LoanCard({ loan, viewAs, onReturn, onRemind }: LoanCardProps) {
  const canReturn = viewAs === "owner" && loan.status === "ACTIVE";
  const canRemind =
    viewAs === "owner" &&
    (loan.status === "ACTIVE" || loan.status === "OVERDUE");
  const isOverdue = loan.computedStatus === "OVERDUE";
  const contactName =
    viewAs === "owner"
      ? (loan.borrower?.name ?? "Inconnu")
      : (loan.owner?.name ?? "Inconnu");

  return (
    <div className={`card-vhs p-4 ${isOverdue ? "border-destructive/50" : ""}`}>
      {/* Object info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
          {loan.object.coverImage ? (
            <img
              src={loan.object.coverImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-mono text-sm font-medium truncate">
            {loan.object.name}
          </h3>
          <p className="text-xs text-muted-foreground">{contactName}</p>
        </div>
        <StatusBadge status={loan.computedStatus} />
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-3">
        <span>Prêté le {formatDate(loan.lentAt)}</span>
        {loan.returnDueDate && (
          <span className={isOverdue ? "text-destructive" : ""}>
            ← {formatRelativeDate(loan.returnDueDate)}
          </span>
        )}
      </div>

      {/* Notes */}
      {loan.notes && (
        <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2">
          {loan.notes}
        </p>
      )}

      {/* Actions */}
      {viewAs === "owner" && (
        <div className="flex items-center gap-2">
          {canReturn && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReturn?.(loan.id)}
              className="flex-1"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Marquer rendu
            </Button>
          )}
          {canRemind && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemind?.(loan.id)}
            >
              <Bell className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function LoansPage() {
  const [activeTab, setActiveTab] = useState<Tab>("lent");
  const utils = trpc.useUtils();

  // Object picker state
  const [showObjectPicker, setShowObjectPicker] = useState(false);
  const [objectSearch, setObjectSearch] = useState("");
  const [selectedObjectForLoan, setSelectedObjectForLoan] = useState<{ id: string; name: string } | null>(null);

  const { data: lentData, isLoading: isLoadingLent } =
    trpc.loans.lentOut.useQuery(undefined);
  const { data: borrowedData, isLoading: isLoadingBorrowed } =
    trpc.loans.borrowed.useQuery(undefined);
  const { data: historyData, isLoading: isLoadingHistory } =
    trpc.loans.history.useQuery(undefined);

  const returnMutation = trpc.loans.return.useMutation({
    onSuccess: () => {
      toast.success("Prêt marqué comme rendu");
      utils.loans.lentOut.invalidate();
      utils.loans.borrowed.invalidate();
      utils.loans.history.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors du retour");
    },
  });

  const remindMutation = trpc.loans.remind.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Rappel envoyé");
      utils.loans.lentOut.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors du rappel");
    },
  });

  function handleReturn(loanId: string) {
    returnMutation.mutate({ loanId });
  }

  function handleRemind(loanId: string) {
    remindMutation.mutate({ loanId });
  }

  const lentLoans = lentData?.items ?? [];
  const borrowedLoans = borrowedData?.items ?? [];
  const historyLoans = historyData?.items ?? [];

  const isLoading =
    activeTab === "lent"
      ? isLoadingLent
      : activeTab === "borrowed"
        ? isLoadingBorrowed
        : isLoadingHistory;

  const currentLoans =
    activeTab === "lent"
      ? lentLoans
      : activeTab === "borrowed"
        ? borrowedLoans
        : historyLoans;

  const tabCounts = {
    lent: lentLoans.length,
    borrowed: borrowedLoans.length,
    history: historyLoans.length,
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display text-3xl vhs-text-glow text-primary">
              PRÊTS
            </h1>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              Suivez vos prêts et emprunts
            </p>
          </div>
          <Button
            onClick={() => setShowObjectPicker(true)}
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            NOUVEAU PRÊT
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 sm:px-3 rounded-md text-[10px] sm:text-xs font-mono uppercase transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tabCounts[tab.id] > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id
                      ? "bg-primary-foreground/20"
                      : "bg-muted"
                  }`}
                >
                  {tabCounts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && currentLoans.length === 0 && (
          <div className="card-vhs p-8 text-center">
            <Repeat className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-xl text-muted-foreground mb-2">
              {activeTab === "lent"
                ? "AUCUN PRÊT EN COURS"
                : activeTab === "borrowed"
                  ? "AUCUN EMPRUNT"
                  : "AUCUN HISTORIQUE"}
            </h2>
            <p className="font-mono text-sm text-muted-foreground">
              {activeTab === "lent"
                ? "Vos objets prêtés apparaîtront ici"
                : activeTab === "borrowed"
                  ? "Les objets que vous avez empruntés apparaîtront ici"
                  : "Votre historique de prêts apparaîtra ici"}
            </p>
          </div>
        )}

        {/* Loan list */}
        {!isLoading && currentLoans.length > 0 && (
          <div className="space-y-4">
            {currentLoans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                viewAs={activeTab === "borrowed" ? "borrower" : "owner"}
                onReturn={handleReturn}
                onRemind={handleRemind}
              />
            ))}
          </div>
        )}

        {/* Object picker dialog */}
        <ObjectPickerDialog
          open={showObjectPicker}
          onOpenChange={(open) => {
            setShowObjectPicker(open);
            if (!open) {
              setObjectSearch("");
              setSelectedObjectForLoan(null);
            }
          }}
          onObjectSelected={(object) => {
            setSelectedObjectForLoan(object);
          }}
          searchQuery={objectSearch}
          onSearchChange={setObjectSearch}
        />

        {/* Create loan dialog */}
        {selectedObjectForLoan && (
          <CreateLoanDialogWrapper
            objectId={selectedObjectForLoan.id}
            objectName={selectedObjectForLoan.name}
            onClose={() => {
              setSelectedObjectForLoan(null);
              setShowObjectPicker(false);
              setObjectSearch("");
            }}
          />
        )}
      </main>

      <Navigation />
    </div>
  );
}

/**
 * Dialog de sélection d'objet pour créer un prêt.
 */
function ObjectPickerDialog({
  open,
  onOpenChange,
  onObjectSelected,
  searchQuery,
  onSearchChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onObjectSelected: (object: { id: string; name: string }) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  const { data, isLoading } = trpc.objects.all.useQuery({
    status: "available",
    search: searchQuery || undefined,
    limit: 50,
  });

  const availableObjects = data?.items.filter((o) => !o.currentLoan) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sélectionner un objet à prêter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un objet..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Object list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner-vhs w-6 h-6" />
            </div>
          ) : availableObjects.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-mono text-sm text-muted-foreground">
                {searchQuery
                  ? "Aucun objet disponible ne correspond"
                  : "Aucun objet disponible — tous sont déjà prêtés ou vous n'avez pas d'objets"}
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {availableObjects.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => {
                    onObjectSelected({ id: obj.id, name: obj.name });
                    onOpenChange(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    {obj.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={obj.coverImage} alt="" className="w-full h-full object-cover rounded" />
                    ) : (
                      <Package className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm truncate">{obj.name}</p>
                    <p className="font-mono text-xs text-muted-foreground truncate">
                      {obj.collection.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Wrapper qui ouvre CreateLoanDialog et reset le state parent après fermeture.
 */
function CreateLoanDialogWrapper({
  objectId,
  objectName,
  onClose,
}: {
  objectId: string;
  objectName: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <CreateLoanDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) onClose();
      }}
      objectId={objectId}
      objectName={objectName}
    />
  );
}
