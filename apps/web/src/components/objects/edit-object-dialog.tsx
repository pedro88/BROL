"use client";

import { useState } from "react";
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

          {/* BOOK / FILM — ISBN */}
          {showIsbn && (
            <div className="space-y-2">
              <Label htmlFor="edit-isbn" className="font-mono text-xs uppercase">
                ISBN
              </Label>
              <Input
                id="edit-isbn"
                placeholder="978-2-07-040850-4"
                {...register("isbn")}
              />
            </div>
          )}

          {/* BOARD_GAME specific fields */}
          {showBoardGameFields && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-playersMin" className="font-mono text-xs uppercase">
                    Joueurs min.
                  </Label>
                  <Input
                    id="edit-playersMin"
                    type="number"
                    min={1}
                    placeholder="2"
                    {...register("playersMin", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-playersMax" className="font-mono text-xs uppercase">
                    Joueurs max.
                  </Label>
                  <Input
                    id="edit-playersMax"
                    type="number"
                    min={1}
                    placeholder="6"
                    {...register("playersMax", { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-playingTimeMinutes" className="font-mono text-xs uppercase">
                    Durée (min.)
                  </Label>
                  <Input
                    id="edit-playingTimeMinutes"
                    type="number"
                    min={1}
                    placeholder="60"
                    {...register("playingTimeMinutes", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-ageMin" className="font-mono text-xs uppercase">
                    Âge min.
                  </Label>
                  <Input
                    id="edit-ageMin"
                    type="number"
                    min={0}
                    placeholder="8"
                    {...register("ageMin", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </>
          )}

          {/* ELECTRIC specific fields */}
          {showElectricFields && (
            <div className="space-y-2">
              <Label htmlFor="edit-powerWatts" className="font-mono text-xs uppercase">
                Puissance (W)
              </Label>
              <Input
                id="edit-powerWatts"
                type="number"
                min={1}
                placeholder="500"
                {...register("powerWatts", { valueAsNumber: true })}
              />
            </div>
          )}

          {/* CLOTHING specific fields */}
          {showClothingFields && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-clothingSize" className="font-mono text-xs uppercase">
                    Taille
                  </Label>
                  <select
                    id="edit-clothingSize"
                    {...register("clothingSize")}
                    className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Sélectionner</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="34">34</option>
                    <option value="36">36</option>
                    <option value="38">38</option>
                    <option value="40">40</option>
                    <option value="42">42</option>
                    <option value="44">44</option>
                    <option value="46">46</option>
                    <option value="48">48</option>
                    <option value="50">50</option>
                    <option value="52">52</option>
                    <option value="54">54</option>
                    <option value="56">56</option>
                    <option value="Enfant">Enfant</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-clothingGender" className="font-mono text-xs uppercase">
                    Genre
                  </Label>
                  <select
                    id="edit-clothingGender"
                    {...register("clothingGender")}
                    className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Unisexe">Unisexe</option>
                    <option value="Enfant">Enfant</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-clothingColor" className="font-mono text-xs uppercase">
                    Couleur
                  </Label>
                  <Input
                    id="edit-clothingColor"
                    placeholder="Noir, bleu..."
                    {...register("clothingColor")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-clothingMaterial" className="font-mono text-xs uppercase">
                    Matière
                  </Label>
                  <Input
                    id="edit-clothingMaterial"
                    placeholder="Coton, cuir..."
                    {...register("clothingMaterial")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-brand-clothing" className="font-mono text-xs uppercase">
                  Marque
                </Label>
                <Input
                  id="edit-brand-clothing"
                  placeholder="Nike, Levi's..."
                  {...register("brand")}
                />
              </div>
            </>
          )}

          {/* TOOL specific fields */}
          {showToolFields && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-toolSector" className="font-mono text-xs uppercase">
                    Secteur / Usage
                  </Label>
                  <select
                    id="edit-toolSector"
                    {...register("toolSector")}
                    className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Bricolage">Bricolage</option>
                    <option value="Jardinage">Jardinage</option>
                    <option value="Automobile">Automobile</option>
                    <option value="Plomberie">Plomberie</option>
                    <option value="Électricité">Électricité</option>
                    <option value="Construction">Construction</option>
                    <option value="Menuiserie">Menuiserie</option>
                    <option value="Peinture">Peinture</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-toolPowerSource" className="font-mono text-xs uppercase">
                    Alimentation
                  </Label>
                  <select
                    id="edit-toolPowerSource"
                    {...register("toolPowerSource")}
                    className="flex h-10 w-full bg-input border-2 border-border px-4 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Sélectionner</option>
                    <option value="MANUAL">Manuel (non alimenté)</option>
                    <option value="MAINS">Secteur (filaire)</option>
                    <option value="BATTERY">Sur batterie</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-brand-tool" className="font-mono text-xs uppercase">
                  Marque
                </Label>
                <Input
                  id="edit-brand-tool"
                  placeholder="Bosch, Makita..."
                  {...register("brand")}
                />
              </div>
            </>
          )}

          {/* CUSTOM specific fields */}
          {showCustomFields && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-customField1" className="font-mono text-xs uppercase">
                  Champ libre 1
                </Label>
                <Input
                  id="edit-customField1"
                  placeholder="Valeur..."
                  {...register("customField1")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-customField2" className="font-mono text-xs uppercase">
                  Champ libre 2
                </Label>
                <Input
                  id="edit-customField2"
                  placeholder="Valeur..."
                  {...register("customField2")}
                />
              </div>
            </>
          )}

          {/* Pricing toggle — available for all object types */}
          <div className="border-t-2 border-border pt-4 mt-4">
            <button
              type="button"
              onClick={() => setPricingEnabled(!pricingEnabled)}
              className={`
                w-full flex items-center justify-between px-4 py-3 border-2 border-border
                hover:border-primary/50 transition-colors
                ${pricingEnabled ? "border-primary bg-primary/10" : ""}
              `}
            >
              <span className="font-mono text-xs uppercase">
                {pricingEnabled ? "▼ Tarification activée" : "▶ Activer la tarification"}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {pricingEnabled ? "Désactiver" : "Optionnel"}
              </span>
            </button>

            {/* Pricing fields */}
            {pricingEnabled && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-cautionAmount" className="font-mono text-xs uppercase">
                      Caution (€)
                    </Label>
                    <Input
                      id="edit-cautionAmount"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="50.00"
                      {...register("cautionAmount", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-rentalPriceDay" className="font-mono text-xs uppercase">
                      Prix / jour (€)
                    </Label>
                    <Input
                      id="edit-rentalPriceDay"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="5.00"
                      {...register("rentalPriceDay", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-rentalPriceHour" className="font-mono text-xs uppercase">
                      Prix / heure (€)
                    </Label>
                    <Input
                      id="edit-rentalPriceHour"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="1.00"
                      {...register("rentalPriceHour", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-rentalPriceWeek" className="font-mono text-xs uppercase">
                      Prix / semaine (€)
                    </Label>
                    <Input
                      id="edit-rentalPriceWeek"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="25.00"
                      {...register("rentalPriceWeek", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-rentalPriceKm" className="font-mono text-xs uppercase">
                      Prix / km (€)
                    </Label>
                    <Input
                      id="edit-rentalPriceKm"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.50"
                      {...register("rentalPriceKm", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            )}
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
