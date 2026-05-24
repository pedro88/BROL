"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { trpc } from "../../lib/trpc";
import { Loader2, Search, User, UserPlus, QrCode, Hash, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type Tab = "contacts" | "id-qr" | "new-contact";

interface BorrowerSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (data: { type: "contact"; contactId: string } | { type: "user"; userId: string }) => void;
}

interface ContactItem {
  id: string;
  name: string;
  email: string | null;
  borrowerId: string | null;
}

export function BorrowerSelectDialog({
  open,
  onOpenChange,
  onSelect,
}: BorrowerSelectDialogProps) {
  const [tab, setTab] = useState<Tab>("contacts");
  const [contactSearch, setContactSearch] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);

  // New contact form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const utils = trpc.useUtils();

  // Contacts list query
  const { data: contactsData, isLoading: isLoadingContacts } =
    trpc.contacts.list.useQuery({ limit: 50, search: contactSearch || undefined });

  const contacts: ContactItem[] = contactsData?.items ?? [];

  // User search query (for ID/QR tab - search by name/email)
  const { data: userResults, isLoading: isSearchingUsers } =
    trpc.users.search.useQuery({ query: contactSearch }, { enabled: tab === "contacts" && contactSearch.length > 0 });

  // Lookup user by ID
  const { data: userById, isLoading: isLookingUpById } =
    trpc.users.getById.useQuery({ id: userIdInput }, { enabled: tab === "id-qr" && userIdInput.length > 0 });

  // Create contact mutation
  const createContactMutation = trpc.contacts.create.useMutation({
    onSuccess: (newContact) => {
      utils.contacts.list.invalidate();
      toast.success(`Contact "${newContact.name}" créé`);
      onSelect({ type: "contact", contactId: newContact.id });
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création du contact");
    },
  });

  function handleClose() {
    setTab("contacts");
    setContactSearch("");
    setUserIdInput("");
    setSelectedContact(null);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    onOpenChange(false);
  }

  function handleSelectContact(contact: ContactItem) {
    setSelectedContact(contact);
    onSelect({ type: "contact", contactId: contact.id });
    handleClose();
  }

  function handleSelectUser(user: { id: string }) {
    onSelect({ type: "user", userId: user.id });
    handleClose();
  }

  function handleCreateContact(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createContactMutation.mutate({
      name: newName.trim(),
      email: newEmail.trim() || undefined,
      phone: newPhone.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ajouter un emprunteur</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Recherchez un contact, ajoutez par ID, ou créez un nouveau contact.
          </DialogDescription>
        </DialogHeader>

        {/* Tab navigation */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => { setTab("contacts"); setContactSearch(""); }}
            className={`flex-1 py-2 px-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
              tab === "contacts"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Mes contacts
          </button>
          <button
            type="button"
            onClick={() => { setTab("id-qr"); setContactSearch(""); setUserIdInput(""); }}
            className={`flex-1 py-2 px-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
              tab === "id-qr"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            ID / QR
          </button>
          <button
            type="button"
            onClick={() => { setTab("new-contact"); setNewName(""); setNewEmail(""); setNewPhone(""); }}
            className={`flex-1 py-2 px-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
              tab === "new-contact"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Nouveau
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto py-4">
          {tab === "contacts" && (
            <div className="space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
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
                    <span className="text-xs">✕</span>
                  </button>
                )}
              </div>

              {/* User search results (Brol users matching query) */}
              {contactSearch.length > 0 && userResults && userResults.length > 0 && (
                <div className="space-y-1">
                  <p className="font-mono text-xs text-muted-foreground uppercase mb-1">
                    Utilisateurs Brol
                  </p>
                  {userResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded text-left bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-mono">
                        {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm truncate">{user.name ?? user.email}</p>
                        <p className="font-mono text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {/* Contacts list */}
              {isLoadingContacts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : contacts.length === 0 && !contactSearch ? (
                <div className="text-center py-8">
                  <User className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="font-mono text-sm text-muted-foreground">
                    Aucun contact enregistré
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTab("new-contact")}
                    className="mt-3"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Créer un contact
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => handleSelectContact(contact)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-muted transition-colors"
                    >
                      <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm truncate">{contact.name}</p>
                        <p className="font-mono text-xs text-muted-foreground truncate">
                          {contact.email ?? "sans email"}
                          {contact.borrowerId && (
                            <span className="ml-2 text-primary">✓ compte Brol</span>
                          )}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "id-qr" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userIdInput">ID Utilisateur</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="userIdInput"
                    type="text"
                    placeholder="Tappez un ID utilisateur..."
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    className="w-full bg-input border-2 border-border pl-10 pr-10 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                  {userIdInput && (
                    <button
                      type="button"
                      onClick={() => setUserIdInput("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                    >
                      <span className="text-xs">✕</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Lookup result */}
              {isLookingUpById && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {userById && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-md">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-mono">
                      {userById.name?.[0]?.toUpperCase() ?? userById.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium">{userById.name ?? "Sans nom"}</p>
                      <p className="font-mono text-xs text-muted-foreground">{userById.email}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleSelectUser(userById)}
                    className="w-full"
                  >
                    Sélectionner cet utilisateur
                  </Button>
                </div>
              )}

              {userIdInput.length > 0 && !userById && !isLookingUpById && (
                <p className="text-center font-mono text-sm text-muted-foreground">
                  Aucun utilisateur trouvé avec cet ID
                </p>
              )}

              {/* QR Scan button - placeholder for future QR scanner integration */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  // TODO: integrate QR scanner
                  alert("Scanner QR à implémenter");
                }}
              >
                <QrCode className="w-4 h-4" />
                Scanner un QR code
              </Button>
            </div>
          )}

          {tab === "new-contact" && (
            <form onSubmit={handleCreateContact} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newContactName">Nom *</Label>
                <Input
                  id="newContactName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Marie Dupont"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newContactEmail">Email (optionnel)</Label>
                <Input
                  id="newContactEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="marie@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newContactPhone">Téléphone (optionnel)</Label>
                <Input
                  id="newContactPhone"
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+32 xxx xx xx xx"
                />
              </div>

              <Button
                type="submit"
                disabled={!newName.trim() || createContactMutation.isPending}
                className="w-full"
              >
                {createContactMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer le contact
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Import toast from sonner (assumed to be available globally)