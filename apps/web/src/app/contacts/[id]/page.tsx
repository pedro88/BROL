"use client";

import { use } from "react";
import Link from "next/link";
import { Header, Navigation } from "../../../components/navigation";
import { Button } from "../../../components/ui/button";
import { trpc } from "../../../lib/trpc";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "OVERDUE") {
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
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-mono uppercase">
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
  return d.toLocaleDateString("fr-BE", { day: "2-digit", month: "short", year: "numeric" });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ContactDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const utils = trpc.useUtils();

  const { data: contactData, isLoading: isLoadingContact } = trpc.contacts.get.useQuery({ id });
  const loansQuery = trpc.contacts.loansForContact.useQuery({ id });

  if (isLoadingContact) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="px-4 py-6 max-w-lg mx-auto flex items-center justify-center py-12">
          <div className="spinner-vhs w-8 h-8" />
        </main>
        <Navigation />
      </div>
    );
  }

  if (!contactData) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="px-4 py-6 max-w-lg mx-auto text-center">
          <h2 className="font-display text-xl text-muted-foreground mb-4">
            CONTACT INTROUVABLE
          </h2>
          <Link href="/contacts">
            <Button variant="outline">Retour aux contacts</Button>
          </Link>
        </main>
        <Navigation />
      </div>
    );
  }

  const { loans = [] } = contactData;
  const contact = contactData;

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Back button */}
        <Link href="/contacts" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-xs uppercase">Contacts</span>
        </Link>

        {/* Contact info */}
        <div className="card-vhs p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl vhs-text-glow text-primary mb-2">
                {contact.name}
              </h1>
              {contact.email && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-primary">
                    {contact.email}
                  </a>
                </p>
              )}
              {contact.phone && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a href={`tel:${contact.phone}`} className="hover:text-primary">
                    {contact.phone}
                  </a>
                </p>
              )}
              {contact.note && (
                <p className="text-sm text-muted-foreground italic mt-2">
                  {contact.note}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Loan history */}
        <div>
          <h2 className="font-display text-xl vhs-text-glow text-primary mb-4">
            HISTORIQUE DE PRÊTS
          </h2>
          <p className="font-mono text-xs text-muted-foreground mb-4">
            {loans.length} prêt{loans.length !== 1 ? "s" : ""}
          </p>

          {loansQuery.isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="spinner-vhs w-6 h-6" />
            </div>
          )}

          {!loansQuery.isLoading && loans.length === 0 && (
            <div className="card-vhs p-6 text-center">
              <Package className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-mono text-sm text-muted-foreground">
                Aucun prêt avec ce contact
              </p>
            </div>
          )}

          {!loansQuery.isLoading && loans.length > 0 && (
            <div className="space-y-3">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  className={`card-vhs p-4 ${loan.computedStatus === "OVERDUE" ? "border-destructive/50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-mono text-sm font-medium truncate">
                          {loan.object?.name ?? "Objet inconnu"}
                        </h3>
                        <StatusBadge status={loan.computedStatus} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Prêté le {formatDate(loan.lentAt)}
                        {loan.returnDueDate && (
                          <> — retour prévu le {formatDate(loan.returnDueDate)}</>
                        )}
                      </p>
                      {loan.returnedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Rendu le {formatDate(loan.returnedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Navigation />
    </div>
  );
}