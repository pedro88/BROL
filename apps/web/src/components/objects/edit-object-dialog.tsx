"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { updateObjectSchema, type UpdateObjectInput, OBJECT_CONDITIONS } from "@brol/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { trpc } from "../../lib/trpc";

const conditionLabels: Record<string, string> = {
  NEW: "Neuf",
  LIKE_NEW: "Comme neuf",
  GOOD: "Bon",
  FAIR: "Correct",
  POOR: "Mauvais",
};

interface EditObjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectId: string;
  objectName: string;
  initialData?: {
    name?: string;
    author?: string | null;
    edition?: string | null;
    condition?: string;
    notes?: string | null;
  };
  onSuccess?: () => void;
}

/**
 * Dialog pour modifier un objet.
 */
export function EditObjectDialog({
  open,
  onOpenChange,
  objectId,
  objectName,
  initialData,
  onSuccess,
}: EditObjectDialogProps) {
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<UpdateObjectInput>({
    resolver: zodResolver(updateObjectSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      author: initialData?.author ?? null,
      edition: initialData?.edition ?? null,
      condition: (initialData?.condition as UpdateObjectInput["condition"]) ?? "GOOD",
      notes: initialData?.notes ?? null,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name ?? "",
        author: initialData?.author ?? null,
        edition: initialData?.edition ?? null,
        condition: (initialData?.condition as UpdateObjectInput["condition"]) ?? "GOOD",
        notes: initialData?.notes ?? null,
      });
    }
  }, [open, initialData, reset]);

  // Update mutation
  const updateMutation = trpc.objects.update.useMutation({
    onSuccess: () => {
      utils.objects.get.invalidate({ id: objectId });
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const onSubmit = async (data: UpdateObjectInput) => {
    try {
      await updateMutation.mutateAsync({ id: objectId, data });
    } catch (error) {
      console.error("Failed to update object:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>MODIFIER L&apos;OBJET</DialogTitle>
          <DialogDescription>
            Modifier les informations de {objectName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="font-mono text-xs uppercase">
              Nom *
            </Label>
            <Input
              id="edit-name"
              placeholder="Nom de l'objet"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="edit-author" className="font-mono text-xs uppercase">
              Auteur / Marque
            </Label>
            <Input
              id="edit-author"
              placeholder="Auteur ou marque"
              {...register("author")}
            />
          </div>

          {/* Edition */}
          <div className="space-y-2">
            <Label htmlFor="edit-edition" className="font-mono text-xs uppercase">
              Édition / Modèle
            </Label>
            <Input
              id="edit-edition"
              placeholder="Gallimard, 1943"
              {...register("edition")}
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase">État</Label>
            <div className="grid grid-cols-5 gap-2">
              {OBJECT_CONDITIONS.map((condition) => (
                <label
                  key={condition}
                  className={`
                    flex flex-col items-center gap-1 p-2 border-2 border-border cursor-pointer
                    hover:border-primary/50 transition-colors text-center
                    ${watch("condition") === condition ? "border-primary bg-primary/10" : ""}
                  `}
                >
                  <input
                    type="radio"
                    value={condition}
                    {...register("condition")}
                    className="sr-only"
                  />
                  <span className="font-mono text-xs">{conditionLabels[condition]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="font-mono text-xs uppercase">
              Notes
            </Label>
            <textarea
              id="edit-notes"
              rows={3}
              placeholder="Notes ou remarques..."
              {...register("notes")}
              className="flex w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
