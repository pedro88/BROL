"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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

  const t = useTranslations();
  const router = useRouter();
  const utils = trpc.useUtils();

  const createMutation = trpc.loans.create.useMutation({
    onSuccess: () => {
      utils.objects.get.invalidate({ id: objectId });
      toast.success(t("loans.loanCreatedSuccessToast", { objectName }));
      onOpenChange(false);
      setBorrower(null);
      setReturnDueDate("");
      setNotes("");
      router.push("/loans");
    },
    onError: (error) => {
      toast.error(error.message || t("loans.loanCreationErrorToast"));
    },
  });

  function handleSelectBorrower(data: { type: "contact"; contactId: string } | { type: "user"; userId: string }) {
    if (data.type === "contact") {
      setBorrower({ type: "contact", id: data.contactId, label: t("loans.contactLabel") });
    } else {
      setBorrower({ type: "user", id: data.userId, label: t("loans.brolUserLabel") });
    }
    setShowBorrowerSelect(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!borrower) {
      toast.error(t("loans.selectBorrowerErrorToast"));
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
            <DialogTitle>{t("loans.lendObjectDialogTitle")}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t("loans.lendObjectDescription", { objectName })}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Borrower selection */}
            <div className="space-y-2">
              <Label>{t("loans.borrowerLabel")}</Label>
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
                  {t("loans.addBorrowerButtonLabel")}
                </Button>
              )}
            </div>

            {/* Date de retour */}
            <div className="space-y-2">
              <Label htmlFor="returnDate">{t("loans.returnDueDateLabel")}</Label>
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
              <Label htmlFor="notes">{t("loans.notesLabel")}</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("loans.notesPlaceholder")}
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
                {t("loans.cancelButtonLabel")}
              </Button>
              <Button
                type="submit"
                disabled={!borrower || createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {t("loans.confirmLoanButtonLabel")}
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
