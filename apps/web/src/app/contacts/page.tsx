"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Header, Navigation } from "../../components/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";
import { AddContactDialog } from "../../components/contacts/add-contact-dialog";
import {
  Users,
  Plus,
  User,
  Mail,
  Phone,
  ChevronRight,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

interface ContactCardProps {
  contact: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    note: string | null;
    borrowerId: string | null;
  };
  onEdit: (contact: any) => void;
  onDelete: (id: string) => void;
}

function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const t = useTranslations();
  return (
    <div className="card-vhs p-4 flex items-center gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-medium truncate">{contact.name}</p>
        {contact.email && (
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <Mail className="w-3 h-3 flex-shrink-0" />
            {contact.email}
          </p>
        )}
        {contact.phone && (
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <Phone className="w-3 h-3 flex-shrink-0" />
            {contact.phone}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(contact)}
          className="p-2 text-muted-foreground hover:text-primary transition-colors"
          aria-label={t("contacts.editAriaLabel")}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(contact.id)}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
          aria-label={t("contacts.deleteAriaLabel")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <Link
          href={`/contacts/${contact.id}`}
          className="p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  note: string;
}

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: (ContactFormData & { id?: string }) | null;
  onSuccess: () => void;
}

function ContactDialog({
  open,
  onOpenChange,
  contact,
  onSuccess,
}: ContactDialogProps) {
  const t = useTranslations();
  const [form, setForm] = useState<ContactFormData>({
    name: contact?.name ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    note: contact?.note ?? "",
  });

  const utils = trpc.useUtils();
  const isEditing = !!contact?.id;

  const createMutation = trpc.contacts.create.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
      toast.success(t("contacts.createdToast"));
      onSuccess();
      onOpenChange(false);
      setForm({ name: "", email: "", phone: "", note: "" });
    },
    onError: (error) => {
      toast.error(error.message || t("contacts.createErrorToast"));
    },
  });

  const updateMutation = trpc.contacts.update.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
      toast.success(t("contacts.updatedToast"));
      onSuccess();
      onOpenChange(false);
      setForm({ name: "", email: "", phone: "", note: "" });
    },
    onError: (error) => {
      toast.error(error.message || t("contacts.updateErrorToast"));
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(t("contacts.nameRequired"));
      return;
    }

    if (isEditing && contact?.id) {
      updateMutation.mutate({
        id: contact.id,
        data: {
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          note: form.note.trim() || undefined,
        },
      });
    } else {
      createMutation.mutate({
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        note: form.note.trim() || undefined,
      });
    }
  }

  // Reset form when contact prop changes
  if (contact && contact.id && form.name !== contact.name) {
    setForm({
      name: contact.name,
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      note: contact.note ?? "",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("contacts.dialogEditTitle")
              : t("contacts.dialogCreateTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("contacts.nameLabel")}</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("contacts.namePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("contacts.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t("contacts.emailPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("contacts.phoneLabel")}</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder={t("contacts.phonePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">{t("contacts.noteLabel")}</Label>
            <Input
              id="note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder={t("contacts.notePlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing
                ? t("contacts.saveButtonLabel")
                : t("contacts.createButtonLabel")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  open,
  onOpenChange,
  contactId,
  contactName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
  onConfirm: () => void;
}) {
  const t = useTranslations();
  const utils = trpc.useUtils();
  const deleteMutation = trpc.contacts.delete.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
      toast.success(t("contacts.deletedToast"));
      onConfirm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || t("contacts.deleteErrorToast"));
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contacts.deleteDialogTitle")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("contacts.deleteConfirmMessage", { contactName })}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate({ id: contactId })}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ContactsPage() {
  const t = useTranslations();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editContact, setEditContact] = useState<
    (ContactFormData & { id: string }) | null
  >(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = trpc.contacts.list.useQuery(undefined);
  const contacts = data?.items ?? [];

  const deleteContactName = contacts.find((c) => c.id === deleteId)?.name ?? "";

  function handleEdit(contact: (typeof contacts)[0]) {
    setEditContact({
      id: contact.id,
      name: contact.name,
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      note: contact.note ?? "",
    });
  }

  function handleDeleteConfirm() {
    setDeleteId(null);
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display text-3xl vhs-text-glow text-primary">
              {t("contacts.pageTitle")}
            </h1>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            {t("contacts.newButtonLabel")}
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && contacts.length === 0 && (
          <div className="card-vhs p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-xl text-muted-foreground mb-2">
              {t("contacts.emptyTitle")}
            </h2>
            <p className="font-mono text-sm text-muted-foreground mb-4">
              {t("contacts.emptyDescription")}
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("contacts.addButtonLabel")}
            </Button>
          </div>
        )}

        {/* Contacts list */}
        {!isLoading && contacts.length > 0 && (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleEdit}
                onDelete={setDeleteId}
              />
            ))}
          </div>
        )}
      </main>

      <Navigation />

      {/* Create dialog — flow unifié (manuel / ID-handle / QR) */}
      <AddContactDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {/* Edit dialog */}
      {editContact && (
        <ContactDialog
          open={true}
          onOpenChange={(open) => !open && setEditContact(null)}
          contact={editContact}
          onSuccess={() => setEditContact(null)}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <DeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          contactId={deleteId}
          contactName={deleteContactName}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
