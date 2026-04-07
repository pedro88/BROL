"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { createCollectionSchema, type CreateCollectionInput } from "@brol/shared";
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

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Dialog pour créer une nouvelle collection.
 * Utilise react-hook-form + zod pour la validation.
 */
export function CreateCollectionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCollectionDialogProps) {
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCollectionInput>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // Create mutation
  const createMutation = trpc.collections.create.useMutation({
    onSuccess: () => {
      utils.collections.list.invalidate();
      onSuccess?.();
      reset();
    },
  });

  const onSubmit = async (data: CreateCollectionInput) => {
    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      console.error("Failed to create collection:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>NOUVELLE COLLECTION</DialogTitle>
          <DialogDescription>
            Créez une collection pour organiser vos objets
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-mono text-xs uppercase">
              Nom *
            </Label>
            <Input
              id="name"
              placeholder="Ma collection"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="font-mono text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-mono text-xs uppercase">
              Description
            </Label>
            <Input
              id="description"
              placeholder="Une courte description..."
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="font-mono text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
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
              disabled={isSubmitting || createMutation.isPending}
            >
              {createMutation.isPending ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
