"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { createCollectionSchema, OBJECT_TYPES, type CreateCollectionInput } from "@brol/shared";
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
  const t = useTranslations();
  const utils = trpc.useUtils();
  const [isPublic, setIsPublic] = useState(false);
  const [selfServiceEnabled, setSelfServiceEnabled] = useState(false);

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
      type: "BOOK",
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
      setSelectedType("BOOK");
      setValue("type", "BOOK");
      setSelfServiceEnabled(false);
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
      onOpenChange(false);
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<(typeof OBJECT_TYPES)[number]>("BOOK");

  const onSubmit = async (data: CreateCollectionInput) => {
    setError(null);
    try {
      await createMutation.mutateAsync({
        ...data,
        selfServiceMode: selfServiceEnabled ? "CONTACTS" : "OFF",
      });
    } catch (err) {
      console.error("Failed to create collection:", err);
      setError(t("collections.createError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("collections.createTitle")}</DialogTitle>
          <DialogDescription>
            {t("collections.createDescription")}
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
              placeholder={t("collections.namePlaceholder")}
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="font-mono text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
            {error && (
              <p className="font-mono text-xs text-destructive mt-1">{error}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-mono text-xs uppercase">
              Description
            </Label>
            <Input
              id="description"
              placeholder={t("collections.descriptionPlaceholder")}
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="font-mono text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Type selector */}
          <div className="space-y-2">
            <Label htmlFor="type" className="font-mono text-xs uppercase">
              Type d'objets
            </Label>
            <select
              id="type"
              {...register("type")}
              onChange={(e) => {
                const val = e.target.value as typeof selectedType;
                setSelectedType(val);
                setValue("type", val);
              }}
              value={selectedType}
              className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
            >
              {OBJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`collections.typeLabel.${type}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Custom field labels — only for CUSTOM type */}
          {selectedType === "CUSTOM" && (
            <div className="space-y-2 border border-dashed border-border p-3">
              <p className="font-mono text-xs text-muted-foreground">
                Définissez les labels pour les champs libres
              </p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="customField1Label" className="font-mono text-xs uppercase">
                    Champ libre 1
                  </Label>
                  <Input
                    id="customField1Label"
                    placeholder="Champ libre 1"
                    {...register("customField1Label")}
                    className={errors.customField1Label ? "border-destructive" : ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="customField2Label" className="font-mono text-xs uppercase">
                    Champ libre 2
                  </Label>
                  <Input
                    id="customField2Label"
                    placeholder="Champ libre 2"
                    {...register("customField2Label")}
                    className={errors.customField2Label ? "border-destructive" : ""}
                  />
                </div>
              </div>
            </div>
          )}

          {/* isPublic toggle */}
          <div className="flex items-start justify-between gap-4 pt-2">
            <div className="flex-1">
              <Label htmlFor="isPublic" className="font-mono text-xs uppercase cursor-pointer">
                Collection publique
              </Label>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                {t("collections.publicToggleDescription")}
              </p>
            </div>
            <Toggle
              checked={isPublic}
              onChange={handlePublicToggle}
              id="isPublic"
            />
          </div>

          {/* Self-service toggle */}
          <div className="flex items-start justify-between gap-4 pt-2">
            <div className="flex-1">
              <Label htmlFor="selfService" className="font-mono text-xs uppercase cursor-pointer">
                Auto-prêt par contacts
              </Label>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                Permet à vos contacts de s auto-emprunter les objets de cette collection.
              </p>
            </div>
            <Toggle
              checked={selfServiceEnabled}
              onChange={setSelfServiceEnabled}
              id="selfService"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
            >
              {createMutation.isPending ? t("common.creating") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
