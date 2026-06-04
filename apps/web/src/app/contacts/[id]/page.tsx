"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Header, Navigation } from "../../../components/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
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
  Pencil,
  Loader2,
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
  const t = useTranslations();
  const { id } = use(params);
  const utils = trpc.useUtils();
  const [isEditOpen, setIsEditOpen] = useState(false);

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
            {t("contacts.notFoundTitle")}
          </h2>
          <Link href="/contacts">
            <Button variant="outline">{t("contacts.backButtonLabel")}</Button>
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
          <span className="font-mono text-xs uppercase">{t("nav.contacts")}</span>
        </Link>

        {/* Contact info */}
        <div className="card-vhs p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h1 className="font-display text-2xl vhs-text-glow text-primary">
                  {contact.name}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  aria-label={t("contacts.detailEditAriaLabel")}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  {t("common.edit")}
                </Button>
              </div>
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
            {t("contacts.loanHistoryTitle")}
          </h2>
          <p className="font-mono text-xs text-muted-foreground mb-4">
            {t("contacts.loanCount", { count: loans.length })}
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
                {t("contacts.noLoansMessage")}
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
                          {loan.object?.name ?? t("contacts.unknownObject")}
                        </h3>
                        <StatusBadge status={loan.computedStatus} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("contacts.lentOnDate", { date: formatDate(loan.lentAt) })}
                        {loan.returnDueDate && (
                          <> — {t("contacts.returnDueDate", { date: formatDate(loan.returnDueDate) })}</>
                        )}
                      </p>
                      {loan.returnedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("contacts.returnedOnDate", { date: formatDate(loan.returnedAt) })}
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

      <EditContactDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        contact={{
          id: contact.id,
          name: contact.name,
          email: contact.email ?? "",
          phone: contact.phone ?? "",
          note: contact.note ?? "",
        }}
        onSuccess={() => {
          utils.contacts.get.invalidate({ id });
          utils.contacts.list.invalidate();
          setIsEditOpen(false);
        }}
      />
    </div>
  );
}

function EditContactDialog({
  open,
  onOpenChange,
  contact,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: { id: string; name: string; email: string; phone: string; note: string };
  onSuccess: () => void;
}) {
  const t = useTranslations();
  const [form, setForm] = useState({
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    note: contact.note,
  });

  const updateMutation = trpc.contacts.update.useMutation({
    onSuccess: () => {
      toast.success("Contact mis à jour");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    updateMutation.mutate({
      id: contact.id,
      data: {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        note: form.note.trim() || undefined,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contacts.editDialogTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">{t("contacts.editNameLabel")}</Label>
            <Input
              id="edit-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">{t("contacts.editEmailLabel")}</Label>
            <Input
              id="edit-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">{t("contacts.editPhoneLabel")}</Label>
            <Input
              id="edit-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-note">{t("contacts.editNoteLabel")}</Label>
            <Input
              id="edit-note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("contacts.editSaveButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}