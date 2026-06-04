/**
 * Dialogue unifié pour ajouter un contact : manuel, par handle/ID Brol,
 * ou via scan QR. Cohérent avec `BorrowerSelectDialog` côté flux prêt.
 *
 * Pas de "Mes contacts" tab — ce composant est UNIQUEMENT pour la création
 * (édition reste sur `ContactDialog` du flux `/contacts`).
 *
 * @package @brol/web
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { trpc } from "../../lib/trpc";
import { Loader2, UserPlus, QrCode, Hash } from "lucide-react";
import { toast } from "sonner";
import { QrScanner } from "../qr/qr-scanner";

type Tab = "manual" | "id-handle" | "qr";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optionnel — appelé après création réussie. */
  onCreated?: (contactId: string) => void;
}

export function AddContactDialog({
  open,
  onOpenChange,
  onCreated,
}: AddContactDialogProps) {
  const t = useTranslations();
  const [tab, setTab] = useState<Tab>("manual");
  const [showQrScanner, setShowQrScanner] = useState(false);

  // Manual form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  // Handle/ID lookup
  const [userIdInput, setUserIdInput] = useState("");

  const utils = trpc.useUtils();

  const { data: userById, isLoading: isLookingUpById } =
    trpc.users.getById.useQuery(
      { id: userIdInput },
      { enabled: tab === "id-handle" && userIdInput.length > 0 },
    );

  const createMutation = trpc.contacts.create.useMutation({
    onSuccess: (contact) => {
      utils.contacts.list.invalidate();
      toast.success(t("contacts.createdFromScanToast"));
      onCreated?.(contact.id);
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const addFromScanMutation = trpc.contacts.addFromScan.useMutation({
    onSuccess: (contact) => {
      utils.contacts.list.invalidate();
      toast.success(t("contacts.contactAddedToast", { contactName: contact.name }));
      onCreated?.(contact.id);
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || t("contacts.addContactErrorToast"));
    },
  });

  function reset() {
    setTab("manual");
    setName("");
    setEmail("");
    setPhone("");
    setNote("");
    setUserIdInput("");
    setShowQrScanner(false);
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      note: note.trim() || undefined,
    });
  }

  function handleLinkUser(userId: string) {
    addFromScanMutation.mutate({ userId });
  }

  function handleQrScanned(code: string) {
    let extractedId: string | null = null;
    if (code.includes("/profile/")) {
      extractedId = code.split("/profile/").pop() ?? null;
    } else if (code.includes("/qr/")) {
      toast.error(t("contacts.invalidQrErrorToast"));
      setShowQrScanner(false);
      return;
    } else {
      extractedId = code;
    }
    if (!extractedId) {
      toast.error(t("contacts.invalidQrCodeToast"));
      setShowQrScanner(false);
      return;
    }
    setShowQrScanner(false);
    addFromScanMutation.mutate({ userId: extractedId });
  }

  const isPending = createMutation.isPending || addFromScanMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("contacts.newContactDialogTitle")}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t("contacts.addContactDescription")}
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <TabButton active={tab === "manual"} onClick={() => setTab("manual")}>
              {t("contacts.manualTab")}
            </TabButton>
            <TabButton
              active={tab === "id-handle"}
              onClick={() => setTab("id-handle")}
            >
              {t("contacts.idHandleTab")}
            </TabButton>
            <TabButton active={tab === "qr"} onClick={() => setTab("qr")}>
              {t("contacts.qrCodeTab")}
            </TabButton>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            {tab === "manual" && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("contacts.manualNameLabel")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("contacts.manualNamePlaceholder")}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("contacts.manualEmailLabel")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("contacts.manualEmailPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("contacts.manualPhoneLabel")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("contacts.manualPhonePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">{t("contacts.manualNoteLabel")}</Label>
                  <Input
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("contacts.manualNotePlaceholder")}
                    maxLength={500}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!name.trim() || isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("contacts.creatingLabel")}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t("contacts.createContactButtonLabel")}
                    </>
                  )}
                </Button>
              </form>
            )}

            {tab === "id-handle" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userIdInput">{t("contacts.idHandleLabel")}</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="userIdInput"
                      type="text"
                      placeholder={t("contacts.idHandlePlaceholder")}
                      value={userIdInput}
                      onChange={(e) => setUserIdInput(e.target.value)}
                      className="w-full bg-input border-2 border-border pl-10 pr-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {isLookingUpById && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                )}

                {userById && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-md">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-mono">
                        {userById.name?.[0]?.toUpperCase() ??
                          userById.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm font-medium">
                          {userById.name ?? t("contacts.noNameMessage")}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {userById.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleLinkUser(userById.id)}
                      disabled={isPending}
                      className="w-full"
                    >
                      {addFromScanMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      {t("contacts.addThisContactButton")}
                    </Button>
                  </div>
                )}

                {userIdInput.length > 0 && !userById && !isLookingUpById && (
                  <p className="text-center font-mono text-sm text-muted-foreground">
                    {t("contacts.noUserFoundForIdMessage")}
                  </p>
                )}
              </div>
            )}

            {tab === "qr" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("contacts.qrInstructions")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowQrScanner(true)}
                  disabled={isPending}
                >
                  <QrCode className="w-4 h-4" />
                  {t("contacts.openScannerButton")}
                </Button>
                {addFromScanMutation.isPending && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 px-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
