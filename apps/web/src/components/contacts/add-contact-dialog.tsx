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
      toast.success("Contact créé");
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
      toast.success(`Contact "${contact.name}" ajouté`);
      onCreated?.(contact.id);
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Impossible d'ajouter ce contact");
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
      toast.error("Ce QR code n'est pas un profil utilisateur");
      setShowQrScanner(false);
      return;
    } else {
      extractedId = code;
    }
    if (!extractedId) {
      toast.error("QR code invalide");
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
            <DialogTitle>Nouveau contact</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Ajoutez manuellement, par identifiant Brol ou via QR code.
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <TabButton active={tab === "manual"} onClick={() => setTab("manual")}>
              Manuel
            </TabButton>
            <TabButton
              active={tab === "id-handle"}
              onClick={() => setTab("id-handle")}
            >
              ID / Handle
            </TabButton>
            <TabButton active={tab === "qr"} onClick={() => setTab("qr")}>
              QR code
            </TabButton>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            {tab === "manual" && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marie Dupont"
                    maxLength={100}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marie@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+32 470 00 00 00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <Input
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ami, collègue..."
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

            {tab === "id-handle" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userIdInput">Identifiant ou handle</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="userIdInput"
                      type="text"
                      placeholder="#piet1234 ou ID brut"
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
                          {userById.name ?? "Sans nom"}
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
                      Ajouter ce contact
                    </Button>
                  </div>
                )}

                {userIdInput.length > 0 && !userById && !isLookingUpById && (
                  <p className="text-center font-mono text-sm text-muted-foreground">
                    Aucun utilisateur trouvé pour cet identifiant.
                  </p>
                )}
              </div>
            )}

            {tab === "qr" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Scannez le QR code d'un profil Brol pour l'ajouter à vos
                  contacts.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowQrScanner(true)}
                  disabled={isPending}
                >
                  <QrCode className="w-4 h-4" />
                  Ouvrir le scanner
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
