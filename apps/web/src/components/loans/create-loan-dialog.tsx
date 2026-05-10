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
import { Loader2, User } from "lucide-react";

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
      router.push("/loans");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors du prêt");
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
      borrowerId: selectedContactId,
      returnDueDate: returnDueDate ? new Date(returnDueDate) : undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Prêter cet objet</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Vous prêtez <strong>{objectName}</strong> à un de vos contacts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact selection */}
          <div className="space-y-2">
            <Label>Contact *</Label>
            {isLoadingContacts ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <User className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                Aucun contact.{" "}
                <a
                  href="/contacts"
                  className="text-primary hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  Ajoutez-en un
                </a>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
