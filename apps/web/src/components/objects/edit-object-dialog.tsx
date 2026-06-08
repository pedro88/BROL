"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
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


interface EditObjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectId: string;
  objectName: string;
  collectionType?: string | null;
  initialData?: {
    name?: string;
    author?: string | null;
    edition?: string | null;
    condition?: string;
    notes?: string | null;
    isbn?: string | null;
    // BOARD_GAME
    playersMin?: number | null;
    playersMax?: number | null;
    playingTimeMinutes?: number | null;
    ageMin?: number | null;
    // ELECTRIC
    powerWatts?: number | null;
    // CLOTHING
    clothingSize?: string | null;
    clothingGender?: string | null;
    clothingColor?: string | null;
    clothingMaterial?: string | null;
    // TOOL
    toolManual?: boolean | null;
    toolSector?: string | null;
    toolBattery?: boolean | null;
    toolPowerSource?: "MANUAL" | "MAINS" | "BATTERY" | null;
    // Marque (CLOTHING + TOOL)
    brand?: string | null;
    // CUSTOM
    customField1?: string | null;
    customField2?: string | null;
    // Caution et tarification
    cautionAmount?: number | null;
    rentalPriceDay?: number | null;
    rentalPriceHour?: number | null;
    rentalPriceWeek?: number | null;
    rentalPriceKm?: number | null;
    hasPricing?: boolean;
    // Self-service
    selfServiceMode?: "OFF" | "CONTACTS" | "RADIUS" | "PUBLIC" | null;
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
  collectionType,
  initialData,
  onSuccess,
}: EditObjectDialogProps) {
  const utils = trpc.useUtils();
  const t = useTranslations();

  // Determine type for field visibility based on collection type
  const type = collectionType as string ?? "BOOK";
  const showBoardGameFields = type === "BOARD_GAME";
  const showElectricFields = type === "ELECTRIC";
  const showClothingFields = type === "CLOTHING";
  const showToolFields = type === "TOOL";
  const showCustomFields = type === "CUSTOM";
  const showIsbn = type === "BOOK" || type === "FILM";
  // Tarification: disponible pour tous les types, mais désactivée par défaut
  const [pricingEnabled, setPricingEnabled] = useState(initialData?.hasPricing ?? false);
  // Self-service mode selector
  const [selfServiceEnabled, setSelfServiceEnabled] = useState(
    initialData?.selfServiceMode && initialData.selfServiceMode !== "OFF"
      ? true
      : false
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<UpdateObjectInput>({
    resolver: zodResolver(updateObjectSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      author: initialData?.author ?? null,
      edition: initialData?.edition ?? null,
      condition: (initialData?.condition as UpdateObjectInput["condition"]) ?? "GOOD",
      notes: initialData?.notes ?? null,
      isbn: initialData?.isbn ?? null,
      playersMin: initialData?.playersMin ?? null,
      playersMax: initialData?.playersMax ?? null,
      playingTimeMinutes: initialData?.playingTimeMinutes ?? null,
      ageMin: initialData?.ageMin ?? null,
      powerWatts: initialData?.powerWatts ?? null,
      clothingSize: initialData?.clothingSize ?? null,
      clothingGender: initialData?.clothingGender ?? null,
      clothingColor: initialData?.clothingColor ?? null,
      clothingMaterial: initialData?.clothingMaterial ?? null,
      toolManual: initialData?.toolManual ?? null,
      toolSector: initialData?.toolSector ?? null,
      toolBattery: initialData?.toolBattery ?? null,
      toolPowerSource: initialData?.toolPowerSource ?? null,
      brand: initialData?.brand ?? null,
      customField1: initialData?.customField1 ?? null,
      customField2: initialData?.customField2 ?? null,
      cautionAmount: initialData?.cautionAmount ?? null,
      rentalPriceDay: initialData?.rentalPriceDay ?? null,
      rentalPriceHour: initialData?.rentalPriceHour ?? null,
      rentalPriceWeek: initialData?.rentalPriceWeek ?? null,
      rentalPriceKm: initialData?.rentalPriceKm ?? null,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setPricingEnabled(initialData?.hasPricing ?? !!(initialData?.cautionAmount || initialData?.rentalPriceDay || initialData?.rentalPriceHour || initialData?.rentalPriceWeek || initialData?.rentalPriceKm));
      reset({
        name: initialData?.name ?? "",
        author: initialData?.author ?? null,
        edition: initialData?.edition ?? null,
        condition: (initialData?.condition as UpdateObjectInput["condition"]) ?? "GOOD",
        notes: initialData?.notes ?? null,
        isbn: initialData?.isbn ?? null,
        playersMin: initialData?.playersMin ?? null,
        playersMax: initialData?.playersMax ?? null,
        playingTimeMinutes: initialData?.playingTimeMinutes ?? null,
        ageMin: initialData?.ageMin ?? null,
        powerWatts: initialData?.powerWatts ?? null,
        clothingSize: initialData?.clothingSize ?? null,
        clothingGender: initialData?.clothingGender ?? null,
        clothingColor: initialData?.clothingColor ?? null,
        clothingMaterial: initialData?.clothingMaterial ?? null,
        toolManual: initialData?.toolManual ?? null,
        toolSector: initialData?.toolSector ?? null,
        toolBattery: initialData?.toolBattery ?? null,
        customField1: initialData?.customField1 ?? null,
        customField2: initialData?.customField2 ?? null,
        cautionAmount: initialData?.cautionAmount ?? null,
        rentalPriceDay: initialData?.rentalPriceDay ?? null,
        rentalPriceHour: initialData?.rentalPriceHour ?? null,
        rentalPriceWeek: initialData?.rentalPriceWeek ?? null,
        rentalPriceKm: initialData?.rentalPriceKm ?? null,
      });
      setSelfServiceEnabled(initialData?.selfServiceMode && initialData.selfServiceMode !== "OFF" ? true : false);
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
      const submitData = {
        ...data,
        selfServiceMode: selfServiceEnabled ? "CONTACTS" : "OFF",
      };
      await updateMutation.mutateAsync({ id: objectId, data: submitData });
    } catch (error) {
      console.error("Failed to update object:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("objects.editDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("objects.editDialogDescription", { objectName })}
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
              placeholder={t("objects.nameLabel")}
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
          </div>

          {/* Author — CLOTHING + TOOL ont leur propre champ `brand`. */}
          {!showClothingFields && !showToolFields && (
            <div className="space-y-2">
              <Label htmlFor="edit-author" className="font-mono text-xs uppercase">
                {t("objects.authorOrBrand")}
              </Label>
              <Input
                id="edit-author"
                placeholder="Auteur ou marque"
                {...register("author")}
              />
</div>
          )}

          {/* Self-service toggle */}
          <div className="flex items-center justify-between pt-4 mt-4">
            <div className="space-y-1">
              <Label htmlFor="selfService" className="font-mono text-xs uppercase">
                Auto-prêt par contacts
              </Label>
              <p className="font-mono text-xs text-muted-foreground">
                Permet à vos contacts de s'auto-emprunter cet objet.
              </p>
            </div>
            <Switch
              id="selfService"
              checked={selfServiceEnabled}
              onCheckedChange={setSelfServiceEnabled}
            />
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
              {updateMutation.isPending ? t("objects.savingChanges") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
