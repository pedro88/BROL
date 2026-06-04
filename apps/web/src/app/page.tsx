"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Header, Navigation } from "../components/navigation";
import { trpc } from "../lib/trpc";
import { Package, User, Repeat, Download, MessagesSquare } from "lucide-react";
import { useUserAgent } from "../lib/use-user-agent";
import { CreateRequestDialog } from "../components/requests/create-request-dialog";
import { toast } from "sonner";

/**
 * Page d'accueil principale — dashboard utilisateur.
 * Affiche les stats réelles et les actions rapides.
 */
export default function HomePage() {
  const t = useTranslations("dashboard");
  // Stats réelles depuis la DB
  const collectionsQuery = trpc.collections.list.useQuery(undefined, {
    staleTime: 30_000,
  });
  const contactsQuery = trpc.contacts.list.useQuery(undefined, {
    staleTime: 30_000,
  });
  const loansQuery = trpc.loans.lentOut.useQuery(undefined, {
    staleTime: 30_000,
  });
  const borrowedQuery = trpc.loans.borrowed.useQuery(undefined, {
    staleTime: 30_000,
  });

  const { isMobile } = useUserAgent();

  // Dialog "Demander à la communauté"
  const meQuery = trpc.users.me.useQuery();
  const [requestOpen, setRequestOpen] = useState(false);
  const utils = trpc.useUtils();
  const createRequest = trpc.communityRequest.create.useMutation({
    onSuccess: (res) => {
      utils.communityRequest.list.invalidate();
      utils.communityRequest.myRequests.invalidate();
      const n = res?.matchCount;
      if (typeof n !== "number") {
        toast.success("Demande envoyée.");
      } else if (n === 0) {
        toast.success("Demande envoyée — aucun voisin avec cet objet pour l'instant.");
      } else {
        toast.success(
          `Demande envoyée — ${n} voisin${n > 1 ? "s" : ""} notifié${n > 1 ? "s" : ""}.`,
        );
      }
    },
  });

  // Dériver les totaux
  const totalObjects =
    collectionsQuery.data?.items.reduce(
      (sum, c) => sum + (c.objectCount ?? 0),
      0,
    ) ?? 0;
  const lentItems = loansQuery.data?.items ?? [];
  const activeLoans = lentItems.length;
  const overdueLoans = lentItems.filter(
    (l) => (l as typeof l & { computedStatus?: string }).computedStatus === "OVERDUE",
  ).length;
  const borrowedCount = borrowedQuery.data?.items.length ?? 0;
  const totalContacts = contactsQuery.data?.items.length ?? 0;
  const isLoading =
    collectionsQuery.isLoading ||
    contactsQuery.isLoading ||
    loansQuery.isLoading;

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Hero section */}
        <section className="mb-8 text-center">
          <h1 className="font-display text-5xl mb-2 vhs-text-glow text-primary">
            {t("welcome")}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </section>

        {/* Stats — cliquables */}
        <section className="grid grid-cols-2 gap-3 mb-8">
          <StatCard
            href="/objects"
            label={t("statObjects")}
            value={isLoading ? "..." : String(totalObjects)}
            icon={<Package className="w-4 h-4" />}
            trend={
              isLoading
                ? undefined
                : collectionsQuery.data
                  ? t("collectionsCount", { count: collectionsQuery.data.items.length })
                  : undefined
            }
          />
          <StatCard
            href={
              overdueLoans > 0
                ? "/loans?tab=lent&status=overdue"
                : "/loans?tab=lent"
            }
            label={overdueLoans > 0 ? t("statLentOverdue", { count: overdueLoans }) : t("statLent")}
            value={isLoading ? "..." : String(activeLoans)}
            icon={<Repeat className="w-4 h-4" />}
            variant={overdueLoans > 0 ? "warning" : activeLoans > 0 ? "warning" : "default"}
          />
          <StatCard
            href="/objects?status=borrowed"
            label={t("statBorrowed")}
            value={borrowedQuery.isLoading ? "..." : String(borrowedCount)}
            icon={<Download className="w-4 h-4" />}
            variant={borrowedCount > 0 ? "success" : "default"}
          />
          <StatCard
            href="/contacts"
            label={t("statContacts")}
            value={isLoading ? "..." : String(totalContacts)}
            icon={<User className="w-4 h-4" />}
          />
        </section>

        {/* Actions rapides */}
        <section className="space-y-3">
          <h2 className="font-mono text-sm text-muted-foreground mb-3">
            {t("quickActions")}
          </h2>

          <QuickAction
            href="/loans"
            title={t("newLoan")}
            description={t("newLoanDesc")}
            variant="primary"
          />

          <QuickAction
            href="/objects/add"
            title={t("addObject")}
            description={t("addObjectDesc")}
            variant="secondary"
          />

          <button
            type="button"
            onClick={() => setRequestOpen(true)}
            className="card-vhs p-4 w-full text-left hover:border-primary/50 transition-colors flex items-center gap-3"
          >
            <MessagesSquare className="w-5 h-5 text-primary" />
            <div>
              <p className="font-display text-base">{t("askCommunity")}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {t("askCommunityDesc")}
              </p>
            </div>
          </button>

          {/* Scanner uniquement sur mobile */}
          {isMobile && (
            <QuickAction
              href="/scan"
              title={t("scan")}
              description={t("scanDesc")}
              variant="accent"
            />
          )}
        </section>

        <CreateRequestDialog
          open={requestOpen}
          onOpenChange={setRequestOpen}
          city={meQuery.data?.city ?? null}
          onSubmit={async (data) => {
            await createRequest.mutateAsync(data);
          }}
        />

        <MyRequestsSection />

        {/* Prêts récents */}
        <section className="mt-8">
          <h2 className="font-mono text-sm text-muted-foreground mb-3">
            {t("recentLoans")}
          </h2>

          {isLoading ? (
            <div className="card-vhs p-4 text-center">
              <p className="font-mono text-muted-foreground text-sm">
                {t("loading")}
              </p>
            </div>
          ) : loansQuery.data && loansQuery.data.items.length > 0 ? (
            <div className="space-y-3">
              {loansQuery.data.items.slice(0, 3).map((loan) => {
                const borrowerName =
                  (loan as typeof loan & { borrowerName?: string }).borrowerName ??
                  loan.borrower?.name ??
                  "Inconnu";
                return (
                  <Link
                    key={loan.id}
                    href={`/objects/${loan.object.id}`}
                    className="card-vhs p-4 block hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-lg">{loan.object.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          → {borrowerName}
                        </p>
                      </div>
                      {loan.returnDueDate && (
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(loan.returnDueDate).toLocaleDateString(
                            "fr-BE",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="card-vhs p-4 text-center">
              <p className="font-mono text-muted-foreground text-sm">
                {t("noActiveLoan")}
              </p>
            </div>
          )}
        </section>
      </main>

      <Navigation />
    </div>
  );
}

/**
 * Carte statistique cliquable avec valeur et tendance.
 */
function StatCard({
  href,
  label,
  value,
  icon,
  trend,
  variant = "default",
}: {
  href?: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
  trend?: string;
  variant?: "default" | "warning" | "success";
}) {
  const variantStyles = {
    default: "text-foreground",
    warning: "text-accent",
    success: "text-secondary",
  };

  const content = (
    <div className="card-vhs p-3 text-center h-full flex flex-col">
      {icon && (
        <div className="flex justify-center mb-1 text-muted-foreground">
          {icon}
        </div>
      )}
      <p className={`font-display text-3xl ${variantStyles[variant]}`}>
        {value}
      </p>
      <p className="font-mono text-xs text-muted-foreground uppercase">
        {label}
      </p>
      {/* Toujours réserver l'espace du trend pour aligner les hauteurs entre cards. */}
      <p className="font-mono text-xs text-muted-foreground mt-1 min-h-[1rem]">
        {trend ?? " "}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full hover:opacity-90 active:scale-[0.98] transition-all"
      >
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * Bouton d'action rapide stylisé VHS.
 */
function QuickAction({
  href,
  title,
  description,
  variant,
}: {
  href: string;
  title: string;
  description: string;
  variant: "primary" | "secondary" | "accent";
}) {
  const variantStyles = {
    primary: "border-primary hover:bg-primary hover:text-primary-foreground",
    secondary:
      "border-secondary hover:bg-secondary hover:text-secondary-foreground",
    accent: "border-accent hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <Link
      href={href}
      className={`card-vhs block p-4 border-l-4 ${variantStyles[variant]} transition-all hover:scale-[1.02] active:scale-[0.98]`}
    >
      <h3 className="font-display text-xl mb-1">{title}</h3>
      <p className="font-mono text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}

/**
 * Section "Mes demandes" — liste les demandes communauté de l'utilisateur,
 * avec badge sur celles qui ont des messages non-lus.
 */
function MyRequestsSection() {
  const t = useTranslations("dashboard");
  const { data, isLoading } = trpc.communityRequest.myRequests.useQuery(
    undefined,
    { staleTime: 30_000 },
  );

  if (isLoading || !data || data.length === 0) {
    return null;
  }

  const formatDate = (iso: string | Date) =>
    new Intl.DateTimeFormat("fr-BE", {
      day: "numeric",
      month: "short",
    }).format(new Date(iso as string));

  return (
    <section className="mt-8">
      <h2 className="font-mono text-sm text-muted-foreground mb-3">
        {t("myRequests")}
      </h2>
      <div className="space-y-3">
        {data.slice(0, 5).map((req) => (
          <Link
            key={req.id}
            href={`/requests/${req.id}`}
            className="card-vhs p-4 block hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-display text-base truncate">{req.title}</h3>
              {req.unreadCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-mono flex items-center justify-center flex-shrink-0">
                  {req.unreadCount > 9 ? "9+" : req.unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>
                {req.status === "OPEN"
                  ? t("requestOpen")
                  : req.status === "FULFILLED"
                    ? t("requestFulfilled")
                    : req.status === "CANCELLED"
                      ? t("requestCancelled")
                      : t("requestExpired")}
                {req.messageCount > 0 && (
                  <span className="ml-2">
                    · {req.messageCount} message{req.messageCount > 1 ? "s" : ""}
                  </span>
                )}
              </span>
              <span>{formatDate(req.createdAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}