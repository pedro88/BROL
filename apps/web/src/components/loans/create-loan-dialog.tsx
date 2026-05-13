"use client";

import { useState, useMemo } from "react";
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
import { Loader2, User, UserPlus, ChevronLeft, X, Search, ChevronDown } from "lucide-react";

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
  const [contactSearch, setContactSearch] = useState("");

  // S04: inline contact creation
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: contactsData, isLoading: isLoadingContacts } =
    trpc.contacts.list.useQuery({ limit: 100, search: contactSearch || undefined });

  const contacts = contactsData?.items ?? [];

  // Selected contact info for display
  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedContactId) ?? null,
    [contacts, selectedContactId]
  );

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
      setContactSearch("");
      setSelectedContactId(null);
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
            /* Contact selection with search */
            <>
              {isLoadingContacts ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Combobox input */}
                  <div className="space-y-2">
                    <Label htmlFor="contactSearch">Contact</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="contactSearch"
                        type="text"
                        placeholder="Rechercher un contact..."
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="w-full bg-input border-2 border-border pl-10 pr-10 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      />
                      {contactSearch && (
                        <button
                          type="button"
                          onClick={() => setContactSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Selected contact display */}
                  {selectedContact && (
                    <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-md">
                      <User className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm font-medium">{selectedContact.name}</p>
                        {selectedContact.email && (
                          <p className="font-mono text-xs text-muted-foreground truncate">
                            {selectedContact.email}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedContactId(null)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}

                  {/* Contact dropdown */}
                  {!selectedContact && (
                    <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-md p-1">
                      {contacts.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="font-mono text-sm text-muted-foreground mb-2">
                            {contactSearch
                              ? "Aucun contact ne correspond"
                              : "Aucun contact disponible"}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddContact(true)}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Créer "{contactSearch || "nouveau contact"}"
                          </Button>
                        </div>
                      ) : (
                        <>
                          {contacts.map((contact) => (
                            <button
                              key={contact.id}
                              type="button"
                              onClick={() => {
                                setSelectedContactId(contact.id);
                                setContactSearch("");
                              }}
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
                          {/* Create new if search matches no existing contact */}
                          {contactSearch && !contacts.some(
                            (c) => c.name.toLowerCase().includes(contactSearch.toLowerCase())
                          ) && (
                            <button
                              type="button"
                              onClick={() => {
                                setNewContactName(contactSearch);
                                setShowAddContact(true);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded text-left text-primary hover:bg-primary/10 transition-colors border border-dashed border-primary/30"
                            >
                              <UserPlus className="w-4 h-4 flex-shrink-0" />
                              <span className="font-mono text-sm">
                                Créer "{contactSearch}"
                              </span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Add contact button when list has results and nothing selected */}
                  {contacts.length > 0 && !selectedContact && !contactSearch && (
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
                </>
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
