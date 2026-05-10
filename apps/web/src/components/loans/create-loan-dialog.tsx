"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";
import { Loader2, User, UserPlus, ChevronLeft, X } from "lucide-react";

interface CreateLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectId: string;
  objectName: string;
}

export function CreateLoanDialog({
  open,
  onOpenChange,
  objectId,
  objectName,
}: CreateLoanDialogProps) {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [returnDueDate, setReturnDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // S04: inline contact creation
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: contactsData, isLoading: isLoadingContacts } =
    trpc.contacts.list.useQuery({ limit: 100 });

  const contacts = contactsData?.items ?? [];

  const createMutation = trpc.loans.create.useMutation({
    onSuccess: () => {
      utils.objects.get.invalidate({ id: objectId });
      toast.success(`"${objectName}" prêté avec succès`);
      onOpenChange(false);
      setSelectedContactId(null);
      setReturnDueDate("");
      setNotes("");
      setShowAddContact(false);
      setNewContactName("");
      setNewContactEmail("");
      setNewContactPhone("");
      router.push("/loans");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors du prêt");
    },
  });

  // S04: create contact mutation
  const createContactMutation = trpc.contacts.create.useMutation({
    onSuccess: (newContact) => {
      utils.contacts.list.invalidate();
      toast.success(`Contact "${newContact.name}" créé`);
      setSelectedContactId(newContact.id);
      setShowAddContact(false);
      setNewContactName("");
      setNewContactEmail("");
      setNewContactPhone("");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création du contact");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedContactId) {
      toast.error("Sélectionnez un contact");
      return;
    }

    createMutation.mutate({
      objectId,
      contactId: selectedContactId,
      returnDueDate: returnDueDate ? new Date(returnDueDate) : undefined,
      notes: notes.trim() || undefined,
    });
  }

  function handleCreateContact(e: React.FormEvent) {
    e.preventDefault();
    if (!newContactName.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    createContactMutation.mutate({
      name: newContactName.trim(),
      email: newContactEmail.trim() || undefined,
      phone: newContactPhone.trim() || undefined,
    });
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      // Reset state on close
      setShowAddContact(false);
      setNewContactName("");
      setNewContactEmail("");
      setNewContactPhone("");
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showAddContact ? "Nouveau contact" : "Prêter cet objet"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {showAddContact
              ? "Créez un contact pour ce prêt."
              : <>Vous prêtez <strong>{objectName}</strong> à un de vos contacts.</>}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={showAddContact ? handleCreateContact : handleSubmit}
          className="space-y-4"
        >
          {showAddContact ? (
            /* S04: inline contact creation form */
            <>
              <div className="space-y-2">
                <Label htmlFor="contactName">Nom *</Label>
                <Input
                  id="contactName"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Marie Dupont"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email (optionnel)</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="marie@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Téléphone (optionnel)</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+32 xxx xx xx xx"
                />
              </div>
            </>
          ) : (
            /* Contact selection */
            <>
              {isLoadingContacts ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-4">
                  <User className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="font-mono text-sm text-muted-foreground mb-3">
                    Aucun contact.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddContact(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Ajouter un contact
                  </Button>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-md p-1">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => setSelectedContactId(contact.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors ${
                        selectedContactId === contact.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <User className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm truncate">{contact.name}</p>
                        {contact.email && (
                          <p
                            className={`text-xs truncate ${
                              selectedContactId === contact.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {contact.email}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* S04: "Add contact" button when contacts exist */}
              {contacts.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddContact(true)}
                  className="w-full"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Ajouter un contact
                </Button>
              )}

              {/* Date de retour */}
              <div className="space-y-2">
                <Label htmlFor="returnDate">Date de retour prévue (optionnel)</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={returnDueDate}
                  onChange={(e) => setReturnDueDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Rappel pour ce prêt..."
                  maxLength={1000}
                />
              </div>
            </>
          )}

          <DialogFooter>
            {showAddContact ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddContact(false)}
                  disabled={createContactMutation.isPending}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Retour
                </Button>
                <Button
                  type="submit"
                  disabled={!newContactName.trim() || createContactMutation.isPending}
                >
                  {createContactMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Créer le contact
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createMutation.isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedContactId || createMutation.isPending}
                >
                  {createMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Confirmer le prêt
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
