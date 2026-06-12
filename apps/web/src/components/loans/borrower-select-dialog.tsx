"use client";

import { useState, Fragment } from "react";
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
import { useTranslations } from "next-intl";
import { QrScanner } from "../qr/qr-scanner";

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
  const t = useTranslations();
  const [tab, setTab] = useState<Tab>("contacts");
  const [contactSearch, setContactSearch] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);

  // New contact form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNote, setNewNote] = useState("");

  const utils = trpc.useUtils();

  // Contacts list query
  const { data: contactsData, isLoading: isLoadingContacts } =
    trpc.contacts.list.useQuery({ limit: 50, search: contactSearch || undefined });

  const contacts: ContactItem[] = contactsData?.items ?? [];

  // User search query (for contacts tab - live search for Brol users)
  const { data: userResults } =
    trpc.users.search.useQuery({ query: contactSearch }, { enabled: tab === "contacts" && contactSearch.length > 0 });

  // Lookup user by ID
  const { data: userById, isLoading: isLookingUpById } =
    trpc.users.getById.useQuery({ id: userIdInput }, { enabled: tab === "id-qr" && userIdInput.length > 0 });

  // Create contact mutation
  const createContactMutation = trpc.contacts.create.useMutation({
    onSuccess: (newContact) => {
      utils.contacts.list.invalidate();
      toast.success(t("loans.contactCreatedToast", { contactName: newContact.name }));
      onSelect({ type: "contact", contactId: newContact.id });
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || t("loans.contactCreationErrorToast"));
    },
  });

  function handleClose() {
    setTab("contacts");
    setContactSearch("");
    setUserIdInput("");
    setShowQrScanner(false);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewNote("");
    onOpenChange(false);
  }

  function handleSelectContact(contact: ContactItem) {
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
      note: newNote.trim() || undefined,
    });
  }

  async function handleQrScanned(code: string) {
    let extractedId: string | null = null;

    if (code.includes("/profile/")) {
      extractedId = code.split("/profile/").pop()!;
    } else if (code.includes("/qr/")) {
      toast.error(t("loans.invalidQrErrorToast"));
      setShowQrScanner(false);
      return;
    } else {
      extractedId = code;
    }

    const user = await utils.users.getById.fetch({ id: extractedId });
    if (user) {
      toast.success(t("loans.userFoundToast", { user: user.name ?? user.handle ?? user.email ?? "" }));
      onSelect({ type: "user", userId: user.id });
      handleClose();
    } else {
      toast.error(t("loans.noUserForQrErrorToast"));
      setShowQrScanner(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("loans.selectBorrowerDialogTitle")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("loans.selectBorrowerDescription")}
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
            {t("loans.myContactsTab")}
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
            {t("loans.idQrTab")}
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
            {t("loans.newTab")}
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
                  placeholder={t("loans.searchContactPlaceholder")}
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
                    {t("loans.brolUsersLabel")}
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
                    {t("loans.noContactsMessage")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTab("new-contact")}
                    className="mt-3"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    {t("loans.createContactLabel")}
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
                          {contact.email ?? t("loans.noEmailLabel")}
                          {contact.borrowerId && (
                            <span className="ml-2 text-primary">✓ {t("loans.brolAccountLabel")}</span>
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
                <Label htmlFor="userIdInput">{t("loans.userIdLabel")}</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="userIdInput"
                    type="text"
                    placeholder={t("loans.userIdPlaceholder")}
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
                      {userById.name?.[0]?.toUpperCase() ?? userById.email?.[0]?.toUpperCase() ?? userById.handle?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium">{userById.name ?? t("loans.noNameLabel")}</p>
                      {userById.email && <p className="font-mono text-xs text-muted-foreground">{userById.email}</p>}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleSelectUser(userById)}
                    className="w-full"
                  >
                    {t("loans.selectThisUserButton")}
                  </Button>
                </div>
              )}

              {userIdInput.length > 0 && !userById && !isLookingUpById && (
                <p className="text-center font-mono text-sm text-muted-foreground">
                  {t("loans.noUserFoundMessage")}
                </p>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{t("loans.orDivider")}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowQrScanner(true)}
              >
                <QrCode className="w-4 h-4" />
                {t("loans.scanQrButtonLabel")}
              </Button>
            </div>
          )}

          {tab === "new-contact" && (
            <form onSubmit={handleCreateContact} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newContactName">{t("loans.newContactNameLabel")}</Label>
                <Input
                  id="newContactName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t("loans.newContactNamePlaceholder")}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newContactEmail">{t("loans.newContactEmailLabel")}</Label>
                <Input
                  id="newContactEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t("loans.newContactEmailPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newContactPhone">{t("loans.newContactPhoneLabel")}</Label>
                <Input
                  id="newContactPhone"
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder={t("loans.newContactPhonePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newContactNote">{t("loans.newContactNoteLabel")}</Label>
                <Input
                  id="newContactNote"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={t("loans.newContactNotePlaceholder")}
                  maxLength={500}
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
                    {t("loans.creatingLabel")}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t("loans.createContactButton")}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {showQrScanner && (
      <QrScanner
        onCodeScanned={handleQrScanned}
        onClose={() => setShowQrScanner(false)}
      />
    )}
    </>
  );
}