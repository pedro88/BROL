"use client";

import Link from "next/link";
import { Header, Navigation } from "../components/navigation";
import { trpc } from "../lib/trpc";

/**
 * Page d'accueil principale — dashboard utilisateur.
 * Affiche les stats réelles et les actions rapides.
 */
export default function HomePage() {
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

  // Dériver les totaux
  const totalObjects =
    collectionsQuery.data?.items.reduce(
      (sum, c) => sum + (c.objectCount ?? 0),
      0,
    ) ?? 0;
  const activeLoans = loansQuery.data?.items.length ?? 0;
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
            BIENVENUE
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            &gt; Gestion de prêt simplifiée_
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3 mb-8">
          <StatCard
            label="Objets"
            value={isLoading ? "..." : String(totalObjects)}
            trend={
              isLoading
                ? undefined
                : collectionsQuery.data
                  ? `${collectionsQuery.data.items.length} collections`
                  : undefined
            }
          />
          <StatCard
            label="Prêtés"
            value={isLoading ? "..." : String(activeLoans)}
            variant={activeLoans > 0 ? "warning" : "default"}
            trend={isLoading ? undefined : activeLoans > 0 ? "active" : "rien"}
          />
          <StatCard
            label="Contacts"
            value={isLoading ? "..." : String(totalContacts)}
          />
        </section>

        {/* Actions rapides */}
        <section className="space-y-3">
          <h2 className="font-mono text-sm text-muted-foreground mb-3">
            // ACTIONS RAPIDES
          </h2>

          <QuickAction
            href="/loans"
            title="NOUVEAU PRÊT"
            description="Prêter un objet à un contact"
            variant="primary"
          />

          <QuickAction
            href="/objects/add"
            title="AJOUTER UN OBJET"
            description="Encoder un nouvel item"
            variant="secondary"
          />

          <QuickAction
            href="/scan"
            title="SCANNER"
            description="Scanner un QR code"
            variant="accent"
          />
        </section>

        {/* Objets prêtés récemment */}
        <section className="mt-8">
          <h2 className="font-mono text-sm text-muted-foreground mb-3">
            // RETOURS RECENTS
          </h2>

          {isLoading ? (
            <div className="card-vhs p-4 text-center">
              <p className="font-mono text-muted-foreground text-sm">
                Chargement...
              </p>
            </div>
          ) : loansQuery.data && loansQuery.data.items.length > 0 ? (
            <div className="space-y-3">
              {loansQuery.data.items.slice(0, 3).map((loan) => (
                <div key={loan.id} className="card-vhs p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg">{loan.object.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        → {loan.borrower?.name}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="card-vhs p-4 text-center">
              <p className="font-mono text-muted-foreground text-sm">
                Aucun prêt en cours
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
 * Carte statistique avec valeur et tendance.
 */
function StatCard({
  label,
  value,
  trend,
  variant = "default",
}: {
  label: string;
  value: string;
  trend?: string;
  variant?: "default" | "warning" | "success";
}) {
  const variantStyles = {
    default: "text-foreground",
    warning: "text-accent",
    success: "text-secondary",
  };

  return (
    <div className="card-vhs p-3 text-center">
      <p className={`font-display text-3xl ${variantStyles[variant]}`}>
        {value}
      </p>
      <p className="font-mono text-xs text-muted-foreground uppercase">
        {label}
      </p>
      {trend && (
        <p className="font-mono text-xs text-muted-foreground mt-1">{trend}</p>
      )}
    </div>
  );
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
