"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
 * Simple toggle switch component using CSS.
 */
function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={id}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-5 w-9 items-center rounded-full
        transition-colors focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${checked ? "bg-primary" : "bg-muted"}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 rounded-full bg-white shadow
          transition-transform
          ${checked ? "translate-x-[18px]" : "translate-x-[2px]"}
        `}
      />
      {/* Hidden checkbox for accessibility + form value */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        tabIndex={-1}
      />
    </button>
  );
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
  const [isPublic, setIsPublic] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CreateCollectionInput>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
    },
  });

  // Sync toggle with form value
  const handlePublicToggle = (value: boolean) => {
    setIsPublic(value);
    setValue("isPublic", value, { shouldValidate: true });
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      reset();
      setIsPublic(false);
    }
  }, [open, reset]);

  // Create mutation
  const createMutation = trpc.collections.create.useMutation({
    onSuccess: () => {
      utils.collections.list.invalidate();
      utils.collections.listPublic.invalidate();
      onSuccess?.();
      reset();
      setIsPublic(false);
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

          {/* isPublic toggle */}
          <div className="flex items-start justify-between gap-4 pt-2">
            <div className="flex-1">
              <Label htmlFor="isPublic" className="font-mono text-xs uppercase cursor-pointer">
                Collection publique
              </Label>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                Permettre à tous de voir cette collection sans se connecter
              </p>
            </div>
            <Toggle
              checked={isPublic}
              onChange={handlePublicToggle}
              id="isPublic"
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