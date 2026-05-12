"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header, Navigation } from "../../components/navigation";
import { Button } from "../../components/ui/button";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";
import {
  Repeat,
  AlertCircle,
  CheckCircle2,
  Clock,
  Bell,
  ArrowRight,
  Package,
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
        <div className="mb-6">
          <h1 className="font-display text-3xl vhs-text-glow text-primary">
            PRÊTS
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Suivez vos prêts et emprunts
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md text-xs font-mono uppercase transition-all ${
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
      </main>

      <Navigation />
    </div>
  );
}
