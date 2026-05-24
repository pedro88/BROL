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
import { Loader2, User, ChevronLeft, X } from "lucide-react";
import { BorrowerSelectDialog } from "./borrower-select-dialog";

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
  const [borrower, setBorrower] = useState<{ type: "contact"; id: string; label: string } | { type: "user"; id: string; label: string } | null>(null);
  const [returnDueDate, setReturnDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [showBorrowerSelect, setShowBorrowerSelect] = useState(false);

  const router = useRouter();
  const utils = trpc.useUtils();

  const createMutation = trpc.loans.create.useMutation({
    onSuccess: () => {
      utils.objects.get.invalidate({ id: objectId });
      toast.success(`"${objectName}" prêté avec succès`);
      onOpenChange(false);
      setBorrower(null);
      setReturnDueDate("");
      setNotes("");
      router.push("/loans");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors du prêt");
    },
  });

  function handleSelectBorrower(data: { type: "contact"; contactId: string } | { type: "user"; userId: string }) {
    if (data.type === "contact") {
      setBorrower({ type: "contact", id: data.contactId, label: "Contact" });
    } else {
      setBorrower({ type: "user", id: data.userId, label: "Utilisateur Brol" });
    }
    setShowBorrowerSelect(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!borrower) {
      toast.error("Sélectionnez un emprunteur");
      return;
    }

    createMutation.mutate({
      objectId,
      contactId: borrower.type === "contact" ? borrower.id : undefined,
      userId: borrower.type === "user" ? borrower.id : undefined,
      returnDueDate: returnDueDate ? new Date(returnDueDate) : undefined,
      notes: notes.trim() || undefined,
    });
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setBorrower(null);
      setReturnDueDate("");
      setNotes("");
      setShowBorrowerSelect(false);
    }
    onOpenChange(open);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Prêter cet objet</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Vous prêtez <strong>{objectName}</strong> à un contact ou un utilisateur Brol.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Borrower selection */}
            <div className="space-y-2">
              <Label>Emprunteur</Label>
              {borrower ? (
                <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-md">
                  <User className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium">{borrower.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBorrower(null)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBorrowerSelect(true)}
                  className="w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Ajouter un emprunteur
                </Button>
              )}
            </div>

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

            <DialogFooter>
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
                disabled={!borrower || createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Confirmer le prêt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BorrowerSelectDialog
        open={showBorrowerSelect}
        onOpenChange={setShowBorrowerSelect}
        onSelect={handleSelectBorrower}
      />
    </>
  );
}
